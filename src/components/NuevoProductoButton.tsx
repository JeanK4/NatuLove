"use client";
 
import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { crearProducto } from "@/lib/actions";
import { formatCOP } from "@/lib/format";
import type { MateriaPrima } from "@/types";
 
interface Props {
  materias: MateriaPrima[];
}
 
interface IngredienteForm {
  id: string;
  materiaPrimaId: string;
  cantidad: number;
}
 
export function NuevoProductoButton({ materias }: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stockMinimo, setStockMinimo] = useState(20);
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([]);
  const [costoManoObra, setCostoManoObra] = useState(0);
  const [costoFijo, setCostoFijo] = useState(0);
  const [costoVariable, setCostoVariable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // Costo de insumos calculado en vivo
  const costoInsumos = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      const mp = materias.find((m) => m.id === ing.materiaPrimaId);
      if (!mp) return acc;
      return acc + ing.cantidad * mp.precioActual;
    }, 0);
  }, [ingredientes, materias]);
 
  const costoTotal = costoInsumos + costoManoObra + costoFijo + costoVariable;
 
  function agregarIngrediente() {
    setIngredientes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        materiaPrimaId: materias[0]?.id ?? "",
        cantidad: 0,
      },
    ]);
  }
 
  function actualizarIngrediente(
    id: string,
    cambios: Partial<IngredienteForm>
  ) {
    setIngredientes((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, ...cambios } : ing))
    );
  }
 
  function quitarIngrediente(id: string) {
    setIngredientes((prev) => prev.filter((ing) => ing.id !== id));
  }
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
 
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (ingredientes.length === 0) {
      setError("Agrega al menos un ingrediente a la receta");
      return;
    }
    if (ingredientes.some((i) => i.cantidad <= 0)) {
      setError("Todos los ingredientes deben tener cantidad mayor a 0");
      return;
    }
    if (ingredientes.some((i) => !i.materiaPrimaId)) {
      setError("Selecciona un insumo en cada fila");
      return;
    }
 
    setLoading(true);
 
    const formData = new FormData();
    formData.set("nombre", nombre);
    formData.set("descripcion", descripcion);
    formData.set("stockMinimo", String(stockMinimo));
    formData.set("costoManoObra", String(costoManoObra));
    formData.set("costoFijo", String(costoFijo));
    formData.set("costoVariable", String(costoVariable));
    formData.set(
      "receta",
      JSON.stringify(
        ingredientes.map((i) => {
          const mp = materias.find((m) => m.id === i.materiaPrimaId);
          return {
            materiaPrimaId: i.materiaPrimaId,
            cantidad: i.cantidad,
            unidad: mp?.unidad ?? "und",
          };
        })
      )
    );
 
    const result = await crearProducto(formData);
    setLoading(false);
 
    if (result.error) {
      setError(result.error);
      return;
    }
    handleClose();
  }
 
  function handleClose() {
    if (loading) return;
    setOpen(false);
    setNombre("");
    setDescripcion("");
    setStockMinimo(20);
    setIngredientes([]);
    setCostoManoObra(0);
    setCostoFijo(0);
    setCostoVariable(0);
    setError(null);
  }
 
  return (
    <>
      <Button
        icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
        onClick={() => setOpen(true)}
      >
        Nuevo Producto
      </Button>
 
      <Modal
        open={open}
        onClose={handleClose}
        title="Nuevo Producto"
        subtitle="Define el producto, su receta y los costos adicionales"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre del producto" required className="col-span-2">
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Jabón de Caléndula"
                className="input"
              />
            </Field>
            <Field label="Descripción" className="col-span-2">
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Receta artesanal con ingredientes naturales"
                className="input"
              />
            </Field>
            <Field label="Stock mínimo">
              <input
                type="number"
                min="1"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Number(e.target.value))}
                className="input"
              />
              <span className="text-xs text-slate-500 mt-1 inline-block">
                Genera alerta cuando esté por debajo
              </span>
            </Field>
          </div>
 
          {/* Costos adicionales */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
            <h3 className="text-sm font-bold text-slate-900">
              Costos adicionales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">
              Por unidad producida (sumados al costo de insumos)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Mano de obra">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={costoManoObra || ""}
                    onChange={(e) => setCostoManoObra(Number(e.target.value))}
                    className="input pl-7"
                    placeholder="0"
                  />
                </div>
              </Field>
              <Field label="Costo fijo">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={costoFijo || ""}
                    onChange={(e) => setCostoFijo(Number(e.target.value))}
                    className="input pl-7"
                    placeholder="0"
                  />
                </div>
              </Field>
              <Field label="Costo variable">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={costoVariable || ""}
                    onChange={(e) => setCostoVariable(Number(e.target.value))}
                    className="input pl-7"
                    placeholder="0"
                  />
                </div>
              </Field>
            </div>
          </div>
 
          {/* Receta */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Receta del producto
                </h3>
                <p className="text-xs text-slate-500">
                  Insumos necesarios para fabricar una unidad
                </p>
              </div>
              <button
                type="button"
                onClick={agregarIngrediente}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-natu-700 hover:text-natu-800"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Agregar ingrediente
              </button>
            </div>
 
            {ingredientes.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Aún no has agregado ingredientes
                </p>
                <button
                  type="button"
                  onClick={agregarIngrediente}
                  className="mt-2 text-sm font-semibold text-natu-700 hover:text-natu-800"
                >
                  + Agregar el primer ingrediente
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-2 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <div>Insumo</div>
                  <div>Cantidad</div>
                  <div className="text-right">Costo Parcial</div>
                  <div />
                </div>
                <div className="divide-y divide-slate-100">
                  {ingredientes.map((ing) => {
                    const mp = materias.find(
                      (m) => m.id === ing.materiaPrimaId
                    );
                    const parcial = mp ? ing.cantidad * mp.precioActual : 0;
                    return (
                      <div
                        key={ing.id}
                        className="grid grid-cols-[2fr_1fr_1fr_40px] gap-2 px-3 py-2 items-center"
                      >
                        <select
                          value={ing.materiaPrimaId}
                          onChange={(e) =>
                            actualizarIngrediente(ing.id, {
                              materiaPrimaId: e.target.value,
                            })
                          }
                          className="input text-sm py-1.5"
                        >
                          {materias.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre} ({formatCOP(m.precioActual)}/{m.unidad})
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ing.cantidad || ""}
                            onChange={(e) =>
                              actualizarIngrediente(ing.id, {
                                cantidad: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                            className="input text-sm py-1.5 w-full"
                          />
                          <span className="text-xs text-slate-500 shrink-0">
                            {mp?.unidad}
                          </span>
                        </div>
                        <div className="text-right text-sm font-semibold text-slate-700">
                          {formatCOP(parcial)}
                        </div>
                        <button
                          type="button"
                          onClick={() => quitarIngrediente(ing.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Quitar"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })}
                </div>
 
                {/* Desglose de costo total */}
                <div className="bg-slate-50 px-3 py-3 border-t-2 border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Insumos</span>
                    <span>{formatCOP(costoInsumos)}</span>
                  </div>
                  {costoManoObra > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Mano de obra</span>
                      <span>{formatCOP(costoManoObra)}</span>
                    </div>
                  )}
                  {costoFijo > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Costos fijos</span>
                      <span>{formatCOP(costoFijo)}</span>
                    </div>
                  )}
                  {costoVariable > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Costos variables</span>
                      <span>{formatCOP(costoVariable)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Costo total calculado
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatCOP(costoTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
 
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
 
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Producto"}
            </Button>
          </div>
        </form>
 
        <style jsx>{`
          :global(.input) {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            transition: all 0.15s;
            background: white;
          }
          :global(.input:focus) {
            outline: none;
            border-color: #4ade80;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          }
        `}</style>
      </Modal>
    </>
  );
}
 
function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}