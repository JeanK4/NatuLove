"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { crearMateriaPrima } from "@/lib/actions";

export function NuevoInsumoButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await crearMateriaPrima(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <Button
        icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
        onClick={() => setOpen(true)}
      >
        Nuevo Insumo
      </Button>

      <Modal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="Nuevo Insumo"
        subtitle="Agregar una nueva materia prima al inventario"
      >
        <form action={handleSubmit} className="space-y-4">
          <Field label="Nombre del insumo" required>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej. Aceite de Coco"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Unidad" required>
              <select name="unidad" required className="input" defaultValue="kg">
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="L">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="und">Unidades (und)</option>
              </select>
            </Field>

            <Field label="Precio por unidad" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  
                </span>
                <input
                  type="number"
                  name="precioActual"
                  required
                  min="1"
                  step="100"
                  placeholder="$25000"
                  className="input pl-7"
                />
              </div>
            </Field>
          </div>

          <Field label="Proveedor" required>
            <input
              type="text"
              name="proveedor"
              required
              placeholder="Ej. Distribuidora Central"
              className="input"
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Insumo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Estilos del input - se podrían mover a globals.css */}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.15s;
          background: white;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
