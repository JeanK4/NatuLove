"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { registrarMovimiento } from "@/lib/actions";
import type { StockProducto } from "@/types";

interface Props {
  stock: StockProducto[];
}

export function TransferirStockButton({ stock }: Props) {
  const [open, setOpen] = useState(false);
  const [productoId, setProductoId] = useState(stock[0]?.productoId ?? "");
  const [origen, setOrigen] = useState<"planta" | "unicentro">("planta");
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo productos terminados (no insumos)
  const productosDisponibles = stock.filter((s) => !s.esInsumo);
  const productoSel = productosDisponibles.find(
    (s) => s.productoId === productoId
  );
  const destino = origen === "planta" ? "unicentro" : "planta";
  const stockDisponible =
    origen === "planta"
      ? productoSel?.stockPlanta ?? 0
      : productoSel?.stockUnicentro ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (cantidad > stockDisponible) {
      setError(
        `Stock insuficiente en ${origen}. Disponible: ${stockDisponible}`
      );
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("tipo", "traslado");
    formData.set("productoId", productoId);
    formData.set("cantidad", String(cantidad));
    formData.set("unidad", "und");
    formData.set("ubicacion", origen);
    formData.set("ubicacionDestino", destino);
    formData.set(
      "descripcion",
      `Traslado de ${origen} a ${destino}`
    );

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
    setCantidad(1);
    setOrigen("planta");
  }

  return (
    <>
      <Button
        icon={<ArrowLeftRight className="h-4 w-4" strokeWidth={2.5} />}
        onClick={() => setOpen(true)}
      >
        Transferir Stock
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Transferir Stock"
        subtitle="Mover unidades entre Planta de Producción y Unicentro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Producto */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
              Producto <span className="text-red-500">*</span>
            </span>
            <select
              required
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
            >
              {productosDisponibles.map((p) => (
                <option key={p.productoId} value={p.productoId}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* Visualización Origen → Destino */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setOrigen("planta")}
                className={`flex-1 rounded-lg border-2 p-3 text-center transition ${
                  origen === "planta"
                    ? "border-natu-500 bg-white"
                    : "border-transparent bg-white/60 opacity-60"
                }`}
              >
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  {origen === "planta" ? "Desde" : "Hacia"}
                </p>
                <p className="mt-1 font-bold text-slate-900">Planta</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {productoSel?.stockPlanta ?? 0} und disponibles
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setOrigen(origen === "planta" ? "unicentro" : "planta")
                }
                className="rounded-full bg-white border-2 border-slate-200 p-2 hover:border-natu-400 hover:bg-natu-50 transition"
                title="Invertir dirección"
              >
                <ArrowRight
                  className={`h-4 w-4 text-natu-600 transition-transform ${
                    origen === "unicentro" ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>

              <button
                type="button"
                onClick={() => setOrigen("unicentro")}
                className={`flex-1 rounded-lg border-2 p-3 text-center transition ${
                  origen === "unicentro"
                    ? "border-natu-500 bg-white"
                    : "border-transparent bg-white/60 opacity-60"
                }`}
              >
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  {origen === "unicentro" ? "Desde" : "Hacia"}
                </p>
                <p className="mt-1 font-bold text-slate-900">Unicentro</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {productoSel?.stockUnicentro ?? 0} und disponibles
                </p>
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
              Cantidad a transferir <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              required
              min="1"
              max={stockDisponible}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
            />
            <span className="text-xs text-slate-500 mt-1 inline-block">
              Máximo disponible en {origen}: {stockDisponible} unidades
            </span>
          </label>

          {/* Resumen */}
          {productoSel && cantidad > 0 && cantidad <= stockDisponible && (
            <div className="rounded-lg bg-natu-50 border border-natu-200 p-3 text-sm">
              <p className="font-medium text-natu-900">Resumen:</p>
              <p className="text-natu-700 mt-0.5">
                Trasladar <strong>{cantidad} unidades</strong> de{" "}
                <strong>{productoSel.nombre}</strong> desde{" "}
                <strong>{origen === "planta" ? "Planta" : "Unicentro"}</strong>{" "}
                hacia{" "}
                <strong>{destino === "planta" ? "Planta" : "Unicentro"}</strong>
                .
              </p>
            </div>
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
            <Button
              type="submit"
              disabled={
                loading || cantidad <= 0 || cantidad > stockDisponible
              }
            >
              {loading ? "Transfiriendo..." : "Confirmar Transferencia"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
