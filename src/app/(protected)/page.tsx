import {
  Package,
  Calculator,
  Warehouse,
  Bell,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { CostosChart } from "@/components/CostosChart";
import { UltimosMovimientos } from "@/components/UltimosMovimientos";
import { NuevoMovimientoButton } from "@/components/NuevoMovimientoButton";
import { DescargarReporteButton } from "@/components/DescargarReporteButton";
import {
  getKpiPanel,
  getEvolucionCostos,
  getUltimosMovimientos,
  getProductos,
} from "@/lib/services";
import { formatCOP, formatNumber } from "@/lib/format";

export default async function PanelPrincipalPage() {
  const [kpi, evolucion, movimientos, productos] = await Promise.all([
    getKpiPanel(),
    getEvolucionCostos(),
    getUltimosMovimientos(4),
    getProductos(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Principal"
        subtitle="Resumen de la operación de Natu Love"
        actions={
          <>
            <DescargarReporteButton />
            <NuevoMovimientoButton productos={productos} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Insumos Registrados"
          value={kpi.insumosRegistrados}
          icon={<Package className="h-4 w-4" strokeWidth={2} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          label="Costo Prod. Día"
          value={formatCOP(kpi.costoProduccionDia)}
          icon={<Calculator className="h-4 w-4" strokeWidth={2} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          variation={kpi.costoProduccionDiaVariacion}
        />
        <KpiCard
          label="Productos en Inventario"
          value={formatNumber(kpi.productosEnInventario)}
          icon={<Warehouse className="h-4 w-4" strokeWidth={2} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          variation={kpi.productosEnInventarioVariacion}
        />
        <KpiCard
          label="Alertas Pendientes"
          value={kpi.alertasPendientes}
          icon={<Bell className="h-4 w-4" strokeWidth={2} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          subtitle="Requieren atención hoy"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Evolución de Costos
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Histórico últimos 6 meses
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-natu-600">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
              Costo Total de Operación
            </div>
          </div>
          <div className="mt-4">
            <CostosChart data={evolucion} />
          </div>
        </div>

        <UltimosMovimientos movimientos={movimientos} />
      </div>
    </div>
  );
}
