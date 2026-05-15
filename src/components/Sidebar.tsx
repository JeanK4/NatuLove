"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calculator,
  Warehouse,
  Leaf,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UsuarioActual } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/materias-primas", label: "Materias Primas", icon: Package },
  { href: "/costos", label: "Costos de Producción", icon: Calculator },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
];

export function Sidebar({ usuario }: { usuario: UsuarioActual }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const inicial = usuario.nombre.charAt(0).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-natu-50">
          <Leaf className="h-5 w-5 text-natu-600" strokeWidth={2.2} />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Natu Love
        </span>
      </div>

      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-natu-50 text-natu-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? "text-natu-600" : "text-slate-400"
                    }`}
                    strokeWidth={2}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Usuario + Menú */}
      <div className="relative border-t border-slate-100 p-4">
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Cerrar sesión
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-3 rounded-lg p-1 hover:bg-slate-50 transition"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-natu-100 text-sm font-semibold text-natu-700">
            {inicial}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-slate-900">
              {usuario.nombre}
            </p>
            <p className="truncate text-xs text-slate-500">
              {usuario.rol === "admin" ? "Administrador/a" : "Empleado/a"}
            </p>
          </div>
          <ChevronUp
            className={`h-4 w-4 text-slate-400 transition-transform ${
              menuOpen ? "" : "rotate-180"
            }`}
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
}
