"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Calculator, X } from "lucide-react";
import { buscar } from "@/lib/actions";

interface Resultado {
  tipo: "insumo" | "producto";
  id: string;
  nombre: string;
  detalle: string;
}

export function BarraBusqueda() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await buscar(query.trim());
      setResultados(res);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function irA(r: Resultado) {
    setOpen(false);
    setQuery("");
    if (r.tipo === "insumo") {
      router.push("/materias-primas");
    } else {
      router.push("/costos");
    }
  }

  return (
    <div ref={ref} className="relative max-w-xl flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Buscar insumos, productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-natu-400 focus:bg-white focus:ring-2 focus:ring-natu-100"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            setResultados([]);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Buscando...
            </div>
          ) : resultados.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Sin resultados para &quot;{query}&quot;
            </div>
          ) : (
            <ul>
              {resultados.map((r) => {
                const Icon = r.tipo === "insumo" ? Package : Calculator;
                return (
                  <li key={`${r.tipo}-${r.id}`}>
                    <button
                      onClick={() => irA(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          r.tipo === "insumo"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {r.nombre}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {r.detalle}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                        {r.tipo === "insumo" ? "Insumo" : "Producto"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
