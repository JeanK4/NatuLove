"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-natu-100 mb-3">
            <CheckCircle className="h-7 w-7 text-natu-600" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ¡Cuenta creada!
          </h1>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card text-center">
          <p className="text-sm text-slate-700">
            Te enviamos un correo de confirmación a <strong>{email}</strong>.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu
            cuenta.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-natu-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-natu-700"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-natu-100 mb-3">
          <Leaf className="h-7 w-7 text-natu-600" strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Natu Love
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <h2 className="text-xl font-bold text-slate-900">Crear cuenta</h2>
        <p className="text-sm text-slate-500 mt-1">
          Regístrate para acceder al sistema
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
              Nombre completo
            </span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1.5 inline-block">
              Contraseña
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100"
              />
            </div>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-natu-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-natu-600/20 transition hover:bg-natu-700 disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-natu-700 hover:text-natu-800"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
