"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Alerta {
  id: string;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
}

export function CampanaNotificaciones({ alertas }: { alertas: Alerta[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tieneAlertas = alertas.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" strokeWidth={1.8} />
        {tieneAlertas && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              Notificaciones
            </h3>
            {tieneAlertas && (
              <span className="text-xs text-slate-500">
                {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!tieneAlertas ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-natu-500 mb-2" strokeWidth={1.8} />
              <p className="text-sm text-slate-700 font-medium">
                Todo en orden
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No hay alertas de stock bajo
              </p>
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alertas.map((a) => (
                  <li key={a.id} className="px-4 py-3 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {a.productoNombre}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Stock crítico: {a.stockActual} / mín. {a.stockMinimo}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/inventario"
                onClick={() => setOpen(false)}
                className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-natu-700 hover:bg-natu-50 transition"
              >
                Ver inventario completo
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
