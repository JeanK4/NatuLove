"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { registrarReempaque } from "@/lib/actions";
import type { Producto } from "@/types";

interface Props {
  productos: Producto[];
}

export function ReempaqueButton({ productos }: Props) {
  const [open, setOpen] = useState(false);
  const [productoFinalId, setProductoFinalId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [ubicacion, setUbicacion] = useState<"planta" | "unicentro">("planta");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo productos que tienen receta de productos (tienen reempaque definido)
  const productosConReempaque = productos.filter(
    (p) => p.recetaProductos.length > 0
  );

  const productoSel = productosConReempaque.find(
    (p) => p.id === productoFinalId
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("productoFinalId", productoFinalId);
    formData.set("cantidad", String(cantidad));
    formData.set("ubicacion", ubicacion);
    formData.set("descripcion", descripcion);

    const result = await registrarReempaque(formData);
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
    setProductoFinalId("");
    setCantidad(1);
    setDescripcion("");
    setError(null);
  }

  return (
    <>
      <Button
        variant="secondary"
        icon={<Package className="h-4 w-4" strokeWidth={2} />}
        onClick={() => setOpen(true)}
      >
        Armar Cajas
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Armar Cajas / Reempaque"
        subtitle="Convierte unidades sueltas en cajas armadas"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {productosConReempaque.length === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              No hay productos con reempaque definido. Crea primero un producto
              con receta de productos en "Costos de Producción".
            </div>
          ) : (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
                  Producto a armar <span className="text-red-500">*</span>
                </span>
                <select
                  required
                  value={productoFinalId}
                  onChange={(e) => setProductoFinalId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
                >
                  <option value="">Selecciona un producto</option>
                  {productosConReempaque.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </label>

              {/* Preview de lo que se desconta */}
              {productoSel && cantidad > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/30 overflow-hidden">
                  <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Se descontará del inventario
                    </p>
                  </div>
                  <ul className="divide-y divide-blue-100">
                    {productoSel.recetaProductos.map((r) => (
                      <li
                        key={r.id}
                        className="px-4 py-2.5 flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700">
                          {r.ingredienteNombre}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {r.cantidad * cantidad} {r.unidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
                    Cantidad a armar <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
                    Ubicación <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={ubicacion}
                    onChange={(e) =>
                      setUbicacion(e.target.value as "planta" | "unicentro")
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
                  >
                    <option value="planta">Planta de Producción</option>
                    <option value="unicentro">Unicentro</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
                  Descripción (opcional)
                </span>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Lote semanal de cajas..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
                />
              </label>
            </>
          )}

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
            {productosConReempaque.length > 0 && (
              <Button
                type="submit"
                disabled={loading || !productoFinalId}
              >
                {loading ? "Armando..." : "Confirmar Reempaque"}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}