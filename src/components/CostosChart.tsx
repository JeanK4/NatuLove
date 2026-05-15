"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PuntoEvolucionCostos } from "@/types";
import { formatCOP } from "@/lib/format";

interface Props {
  data: PuntoEvolucionCostos[];
}

export function CostosChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />
        <XAxis
          dataKey="mes"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            v === 0 ? "$ 0" : `${(v / 1000).toFixed(0)}.000`
          }
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          formatter={(v: number) => [formatCOP(v), "Costo total"]}
          labelStyle={{ color: "#475569", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="costo"
          stroke="#16a34a"
          strokeWidth={2.5}
          fill="url(#colorCosto)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
