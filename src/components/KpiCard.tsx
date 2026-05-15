import { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  variation?: number;
  subtitle?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  variation,
  subtitle,
}: KpiCardProps) {
  const isPositive = variation !== undefined && variation > 0;
  const isNegative = variation !== undefined && variation < 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {variation !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? "text-natu-600" : isNegative ? "text-red-500" : ""
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 ${isNegative ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
            {isPositive ? "+" : ""}
            {variation}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
