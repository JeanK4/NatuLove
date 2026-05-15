"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login")) {
        setError("Email o contraseña incorrectos");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Debes confirmar tu email antes de iniciar sesión");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-natu-100 mb-3">
          <Leaf className="h-7 w-7 text-natu-600" strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Natu Love
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sistema de gestión de inventario
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-natu-400 focus:ring-2 focus:ring-natu-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-natu-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-natu-600/20 transition hover:bg-natu-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {loading ? "Verificando credenciales..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-natu-700 hover:text-natu-800"
          >
            Regístrate
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        © 2026 Natu Love · Cosmética natural artesanal
      </p>
    </div>
  );
}
