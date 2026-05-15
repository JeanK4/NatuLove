import type { Movimiento } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { Activity } from "lucide-react";

interface Props {
  movimientos: Movimiento[];
}

const DOT_COLORS: Record<string, string> = {
  entrada: "bg-natu-500",
  traslado: "bg-blue-500",
  produccion: "bg-blue-500",
  salida: "bg-red-500",
};

export function UltimosMovimientos({ movimientos }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Últimos Movimientos
        </h3>
        <Activity className="h-4 w-4 text-slate-400" strokeWidth={2} />
      </div>

      <ul className="mt-5 flex-1 space-y-4">
        {movimientos.map((mov) => (
          <li key={mov.id} className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                DOT_COLORS[mov.tipo] ?? "bg-slate-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {mov.productoNombre}
              </p>
              <p className="text-xs text-slate-500">{mov.descripcion}</p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {formatRelativeTime(mov.fecha)}
            </span>
          </li>
        ))}
      </ul>

      <button className="mt-5 w-full rounded-lg bg-natu-50 py-2.5 text-sm font-semibold text-natu-700 transition hover:bg-natu-100">
        Ver Todo el Historial
      </button>
    </div>
  );
}
