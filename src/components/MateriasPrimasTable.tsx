"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { NuevoInsumoButton } from "@/components/NuevoInsumoButton";
import { formatCOP } from "@/lib/format";
import { actualizarPrecio } from "@/lib/actions";
import type { MateriaPrima } from "@/types";
import type { Rol } from "@/lib/auth";

interface Props {
  materias: MateriaPrima[];
  rol: Rol;
}

export function MateriasPrimasTable({ materias, rol }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<MateriaPrima | null>(null);

  const esAdmin = rol === "admin";

  return (
    <>
      <PageHeader
        title="Materias Primas"
        subtitle="Gestión de insumos y control de precios"
        actions={esAdmin ? <NuevoInsumoButton /> : null}
      />

      {!esAdmin && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Estás en modo lectura. Solo el administrador puede crear y editar
            insumos.
          </span>
        </div>
      )}

      {materias.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-card">
          <p className="text-slate-500">
            Aún no hay insumos registrados.
            {esAdmin && (
              <>
                {" "}
                Crea el primero con el botón &quot;Nuevo Insumo&quot;.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="grid grid-cols-[2fr_1fr_1.2fr_1.5fr_60px] gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div>Insumo</div>
            <div>Unidad</div>
            <div>Precio Actual</div>
            <div>Proveedor</div>
            <div className="text-right">Detalle</div>
          </div>

          <div className="divide-y divide-slate-100">
            {materias.map((m) => (
              <div key={m.id}>
                <div
                  className="grid grid-cols-[2fr_1fr_1.2fr_1.5fr_60px] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-slate-50/60 transition"
                  onClick={() =>
                    setExpanded(expanded === m.id ? null : m.id)
                  }
                >
                  <div className="font-semibold text-slate-900">
                    {m.nombre}
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {m.unidad}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {formatCOP(m.precioActual)}
                  </div>
                  <div className="text-sm text-slate-600">{m.proveedor}</div>
                  <div className="flex justify-end">
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        expanded === m.id ? "rotate-180" : ""
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {expanded === m.id && (
                  <div className="bg-slate-50/40 px-6 py-4 text-sm text-slate-600 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                          Última actualización
                        </p>
                        <p className="mt-1 text-slate-700">
                          {new Date(m.fechaActualizacion).toLocaleDateString(
                            "es-CO",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                          ID Insumo
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-700">
                          {m.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-end justify-end">
                        {esAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(m);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-natu-700 hover:text-natu-800"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              strokeWidth={2}
                            />
                            Actualizar precio
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <ActualizarPrecioModal
          materia={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ActualizarPrecioModal({
  materia,
  onClose,
}: {
  materia: MateriaPrima;
  onClose: () => void;
}) {
  const [precio, setPrecio] = useState(materia.precioActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await actualizarPrecio(materia.id, precio);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  const cambio = precio - materia.precioActual;
  const porcentaje =
    materia.precioActual > 0
      ? ((cambio / materia.precioActual) * 100).toFixed(1)
      : "0";

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title={`Actualizar precio: ${materia.nombre}`}
      subtitle="Se guardará en el historial y los costos se recalcularán automáticamente"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Precio actual
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCOP(materia.precioActual)}{" "}
            <span className="text-sm font-normal text-slate-500">
              / {materia.unidad}
            </span>
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
            Nuevo precio <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              $
            </span>
            <input
              type="number"
              required
              min="1"
              step="100"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
            />
          </div>
        </label>

        {cambio !== 0 && (
          <div
            className={`rounded-lg p-3 text-sm ${
              cambio > 0
                ? "bg-amber-50 text-amber-800"
                : "bg-natu-50 text-natu-800"
            }`}
          >
            Cambio: {cambio > 0 ? "+" : ""}
            {formatCOP(cambio)} ({cambio > 0 ? "+" : ""}
            {porcentaje}%)
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
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || precio === materia.precioActual}
          >
            {loading ? "Guardando..." : "Guardar cambio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
