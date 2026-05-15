"use client";
 
import { useState } from "react";
import { ChevronRight, Calculator, Lock, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { NuevoProductoButton } from "@/components/NuevoProductoButton";
import { formatCOP } from "@/lib/format";
import type { Producto, MateriaPrima } from "@/types";
import type { Rol } from "@/lib/auth";
 
interface Props {
  productos: Producto[];
  materias: MateriaPrima[];
  rol: Rol;
}
 
export function CostosProduccionView({ productos, materias, rol }: Props) {
  const [selectedId, setSelectedId] = useState(productos[0]?.id);
  const selected = productos.find((p) => p.id === selectedId) ?? productos[0];
 
  const esAdmin = rol === "admin";
 
  return (
    <>
      <PageHeader
        title="Costos de Producción"
        subtitle="Análisis de recetas y márgenes de rentabilidad"
        actions={esAdmin ? <NuevoProductoButton materias={materias} /> : null}
      />
 
      {!esAdmin && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Estás en modo lectura. Solo el administrador puede crear productos
            y modificar recetas.
          </span>
        </div>
      )}
 
      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          El costo total se recalcula automáticamente cada vez que cambia el
          precio de un insumo. No hay que actualizar manualmente.
        </span>
      </div>
 
      {!selected ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-card">
          <p className="text-slate-500">
            Aún no hay productos.
            {esAdmin && (
              <>
                {" "}
                Crea el primero con el botón &quot;Nuevo Producto&quot;.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card h-fit">
            <h3 className="text-lg font-bold text-slate-900">Productos</h3>
            <ul className="mt-4 space-y-2">
              {productos.map((p) => {
                const isActive = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-natu-200 bg-natu-50/60 border-l-4 border-l-natu-500"
                          : "border-transparent hover:bg-slate-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`truncate font-semibold ${
                            isActive ? "text-natu-900" : "text-slate-900"
                          }`}
                        >
                          {p.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Costo actual: {formatCOP(p.costoActual)}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? "text-natu-600" : "text-slate-400"
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
 
          <div className="rounded-2xl border border-slate-100 bg-white shadow-card overflow-hidden">
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {selected.nombre}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.descripcion ??
                    "Receta estándar y desglose de costos"}
                </p>
              </div>
            </div>
 
            {selected.receta.length === 0 ? (
              <div className="border-t border-slate-100 px-6 py-12 text-center">
                <p className="text-sm text-slate-500">
                  Este producto no tiene receta definida.
                </p>
              </div>
            ) : (
              <>
                <div className="border-t border-slate-100">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-slate-50/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div>Ingrediente</div>
                    <div className="text-center">Cantidad</div>
                    <div className="text-right">Costo Unitario</div>
                    <div className="text-right">Costo Parcial</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selected.receta.map((ing, i) => {
                      const parcial = ing.cantidad * ing.precioUnitario;
                      return (
                        <div
                          key={i}
                          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center"
                        >
                          <div className="font-medium text-slate-900">
                            {ing.nombre}
                          </div>
                          <div className="text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {ing.cantidad} {ing.unidad}
                            </span>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            {formatCOP(ing.precioUnitario)}
                          </div>
                          <div className="text-right font-semibold text-slate-900">
                            {formatCOP(parcial)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
 
                {/* Desglose de costo total */}
                <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-5 space-y-3">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Insumos</span>
                      <span className="font-medium text-slate-900">
                        {formatCOP(selected.costoInsumos)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mano de obra</span>
                      <span className="font-medium text-slate-900">
                        {formatCOP(selected.costoManoObra)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Costos fijos</span>
                      <span className="font-medium text-slate-900">
                        {formatCOP(selected.costoFijo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Costos variables</span>
                      <span className="font-medium text-slate-900">
                        {formatCOP(selected.costoVariable)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <Calculator className="h-4 w-4" strokeWidth={2} />
                      Costo Total Calculado
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-slate-900">
                      {formatCOP(selected.costoActual)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}