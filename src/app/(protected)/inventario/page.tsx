import {
  Building2,
  Store,
  Package,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ReempaqueButton } from "@/components/ReempaqueButton";
import { TransferirStockButton } from "@/components/TransferirStockButton";
import { getProductos, getStockProductos } from "@/lib/services";
import { formatNumber } from "@/lib/format";

export default async function InventarioPage() {
  const [stock, productos] = await Promise.all([
  getStockProductos(),
  getProductos(),
]);

  const totalPlanta = stock.reduce((acc, s) => acc + s.stockPlanta, 0);
  const totalUnicentro = stock.reduce((acc, s) => acc + s.stockUnicentro, 0);
  const totalGlobal = totalPlanta + totalUnicentro;

  const esCritico = (total: number, min: number) => total < min;

  return (
    <>
      <PageHeader
        title="Control de Inventario"
        subtitle="Gestión de stock entre Planta de Producción y Unicentro"
        actions={
          <div className="flex items-center gap-3">
            <ReempaqueButton productos={productos} />
            <TransferirStockButton stock={stock} />
          </div>
  }
/>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Stock en Planta</p>
              <p className="mt-0.5">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatNumber(totalPlanta)}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">unidades</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Store className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Stock en Unicentro</p>
              <p className="mt-0.5">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatNumber(totalUnicentro)}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">unidades</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5 shadow-lg text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
              <Package className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-slate-300">Inventario Total</p>
              <p className="mt-0.5">
                <span className="text-3xl font-bold tracking-tight">
                  {formatNumber(totalGlobal)}
                </span>
                <span className="ml-1.5 text-sm text-slate-400">unidades</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla detalle */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Detalle por Producto
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Stock Crítico
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 bg-slate-50/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Producto / Insumo</div>
          <div className="text-center">Mínimo Ideal</div>
          <div className="text-center">Stock Planta</div>
          <div className="text-center">Stock Unicentro</div>
          <div className="text-right">Total Consolidado</div>
        </div>

        <div className="divide-y divide-slate-100">
          {stock.map((s) => {
            const total = s.stockPlanta + s.stockUnicentro;
            const critico = esCritico(total, s.stockMinimo);
            const plantaCritico = s.esInsumo
              ? s.stockPlanta < s.stockMinimo
              : s.stockPlanta < Math.floor(s.stockMinimo * 0.7);
            const unicentroCritico = s.esInsumo
              ? s.stockUnicentro < s.stockMinimo
              : s.stockUnicentro < Math.floor(s.stockMinimo * 0.4);

            return (
              <div
                key={s.productoId}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center"
              >
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  {s.nombre}
                  {critico && (
                    <AlertTriangle
                      className="h-4 w-4 text-red-500"
                      strokeWidth={2}
                    />
                  )}
                </div>
                <div className="text-center text-sm text-slate-600">
                  {s.stockMinimo}
                </div>
                <div
                  className={`text-center text-sm font-medium ${
                    plantaCritico
                      ? "text-red-500 bg-red-50/50 -mx-2 py-1 rounded"
                      : "text-slate-700"
                  }`}
                >
                  {s.stockPlanta}
                </div>
                <div
                  className={`text-center text-sm font-medium ${
                    unicentroCritico
                      ? "text-red-500 bg-red-50/50 -mx-2 py-1 rounded"
                      : "text-slate-700"
                  }`}
                >
                  {s.stockUnicentro}
                </div>
                <div className="flex justify-end">
                  <span
                    className={`inline-flex items-center justify-center min-w-[40px] rounded-full px-3 py-1 text-xs font-semibold ${
                      critico
                        ? "bg-red-50 text-red-600"
                        : "bg-natu-50 text-natu-700"
                    }`}
                  >
                    {total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-t-2 border-slate-200 bg-slate-50/60 px-6 py-4 items-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Totales
          </div>
          <div />
          <div className="text-center font-bold text-slate-900">
            {totalPlanta}
          </div>
          <div className="text-center font-bold text-slate-900">
            {totalUnicentro}
          </div>
          <div className="text-right font-bold text-slate-900">
            {totalGlobal}
          </div>
        </div>
      </div>
    </>
  );
}
