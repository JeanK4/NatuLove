"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Factory,
  ArrowLeftRight,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { registrarMovimiento } from "@/lib/actions";
import { formatCOP } from "@/lib/format";
import type { Producto } from "@/types";

interface Props {
  productos: Producto[];
}

type TipoMov = "entrada" | "salida" | "produccion" | "traslado";

const TIPOS = [
  {
    value: "entrada" as TipoMov,
    label: "Entrada",
    desc: "Recepción de mercancía",
    icon: ArrowDownToLine,
  },
  {
    value: "salida" as TipoMov,
    label: "Salida",
    desc: "Venta o consumo",
    icon: ArrowUpFromLine,
  },
  {
    value: "produccion" as TipoMov,
    label: "Producción",
    desc: "Fabricar productos (descuenta insumos)",
    icon: Factory,
  },
  {
    value: "traslado" as TipoMov,
    label: "Traslado",
    desc: "Entre Planta y Unicentro",
    icon: ArrowLeftRight,
  },
];

export function NuevoMovimientoButton({ productos }: Props) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoMov>("entrada");
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productoSel = productos.find((p) => p.id === productoId);

  // Para producción: calcular insumos necesarios
  const insumosNecesarios = useMemo(() => {
    if (tipo !== "produccion" || !productoSel) return [];
    return productoSel.receta.map((ing) => ({
      nombre: ing.nombre,
      cantidadNecesaria: ing.cantidad * cantidad,
      unidad: ing.unidad,
      costoTotal: ing.cantidad * cantidad * ing.precioUnitario,
    }));
  }, [tipo, productoSel, cantidad]);

  const costoProduccionTotal = insumosNecesarios.reduce(
    (acc, i) => acc + i.costoTotal,
    0
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("tipo", tipo);
    formData.set("productoId", productoId);
    formData.set("cantidad", String(cantidad));
    if (tipo !== "traslado") formData.delete("ubicacionDestino");
    // Producción siempre va a planta
    if (tipo === "produccion") formData.set("ubicacion", "planta");

    const result = await registrarMovimiento(formData);
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
    setError(null);
    setTipo("entrada");
    setCantidad(1);
  }

  return (
    <>
      <Button
        icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
        onClick={() => setOpen(true)}
      >
        Nuevo Movimiento
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Registrar Movimiento"
        subtitle="Entrada, salida, producción o traslado de inventario"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5">
          {/* Selector de tipo */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 inline-block">
              Tipo de movimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => {
                const Icon = t.icon;
                const active = tipo === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                      active
                        ? "border-natu-500 bg-natu-50/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-natu-100 text-natu-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          active ? "text-natu-900" : "text-slate-900"
                        }`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Producto */}
          <Field label="Producto" required>
            <select
              required
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="input"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Field>

          {/* Cantidad y unidad */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={
                tipo === "produccion"
                  ? "Unidades a producir"
                  : "Cantidad"
              }
              required
            >
              <input
                type="number"
                required
                min="1"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Unidad" required>
              <select
                name="unidad"
                required
                className="input"
                defaultValue="und"
              >
                <option value="und">Unidades</option>
                <option value="kg">Kilogramos</option>
                <option value="L">Litros</option>
              </select>
            </Field>
          </div>

          {/* Ubicación (no aparece en producción - siempre va a planta) */}
          {tipo !== "produccion" && (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label={tipo === "traslado" ? "Desde" : "Ubicación"}
                required
              >
                <select
                  name="ubicacion"
                  required
                  className="input"
                  defaultValue="planta"
                >
                  <option value="planta">Planta de Producción</option>
                  <option value="unicentro">Unicentro</option>
                </select>
              </Field>

              {tipo === "traslado" && (
                <Field label="Hacia" required>
                  <select
                    name="ubicacionDestino"
                    required
                    className="input"
                    defaultValue="unicentro"
                  >
                    <option value="unicentro">Unicentro</option>
                    <option value="planta">Planta de Producción</option>
                  </select>
                </Field>
              )}
            </div>
          )}

          {/* Vista previa de insumos para producción */}
          {tipo === "produccion" && productoSel && cantidad > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Insumos que se descontarán
                </p>
              </div>
              {insumosNecesarios.length === 0 ? (
                <p className="px-4 py-4 text-sm text-amber-700">
                  ⚠️ Este producto no tiene receta definida.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-blue-100">
                    {insumosNecesarios.map((i, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700">{i.nombre}</span>
                        <span className="font-semibold text-slate-900">
                          {i.cantidadNecesaria.toFixed(2)} {i.unidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Costo de producción
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatCOP(costoProduccionTotal)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {tipo === "salida" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              ⚠️ El sistema validará que haya stock suficiente antes de
              registrar.
            </div>
          )}

          <Field label="Descripción (opcional)">
            <input
              type="text"
              name="descripcion"
              placeholder="Ej. Pedido #123, lote semanal..."
              className="input"
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !productoId}>
              {loading ? "Registrando..." : "Registrar Movimiento"}
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
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
