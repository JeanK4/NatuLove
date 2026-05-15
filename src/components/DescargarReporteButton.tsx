"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { generarReporteExcel, generarReportePDF } from "@/lib/reports";

export function DescargarReporteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  async function descargar(tipo: "excel" | "pdf") {
    setOpen(false);
    setLoading(tipo);
    setError(null);
    try {
      const data =
        tipo === "excel"
          ? await generarReporteExcel()
          : await generarReportePDF();

      // Convertir base64 a blob y forzar descarga
      const byteChars = atob(data.base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteArr], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? "Error al generar el reporte");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        {loading === "excel"
          ? "Generando Excel..."
          : loading === "pdf"
            ? "Generando PDF..."
            : "Descargar Reporte"}
        {!loading && (
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-30">
          <button
            onClick={() => descargar("excel")}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-natu-50 text-natu-700">
              <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Excel</p>
              <p className="text-xs text-slate-500">.xlsx con 5 hojas</p>
            </div>
          </button>
          <button
            onClick={() => descargar("pdf")}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left border-t border-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">PDF</p>
              <p className="text-xs text-slate-500">Para imprimir o enviar</p>
            </div>
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 z-30">
          {error}
        </div>
      )}
    </div>
  );
}
