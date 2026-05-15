import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type Rol = "admin" | "empleado";

export interface UsuarioActual {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

/**
 * Obtiene el usuario actual desde Supabase Auth + datos en la DB.
 * Retorna null si no hay sesión.
 */
export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca el perfil en la DB
  let perfil = await prisma.usuario.findUnique({
    where: { id: user.id },
  });

  // Si no existe el perfil aún (primer login), lo crea
  if (!perfil) {
    perfil = await prisma.usuario.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        nombre: user.user_metadata?.nombre ?? user.email?.split("@")[0] ?? "Usuario",
        rol: "empleado", // por defecto - el primer admin se cambia manualmente
      },
    });
  }

  return {
    id: perfil.id,
    email: perfil.email,
    nombre: perfil.nombre,
    rol: perfil.rol as Rol,
  };
}

/**
 * Versión que redirige a /login si no hay sesión.
 * Úsala en páginas protegidas.
 */
export async function requireUsuario(): Promise<UsuarioActual> {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  return usuario;
}

/**
 * Lanza error si el usuario no es admin.
 * Úsala en Server Actions que modifican datos críticos.
 */
export async function requireAdmin(): Promise<UsuarioActual> {
  const usuario = await requireUsuario();
  if (usuario.rol !== "admin") {
    throw new Error("No tienes permisos para realizar esta acción");
  }
  return usuario;
}

/**
 * Verifica si una acción específica está permitida según el rol.
 */
export function puedeRealizar(
  rol: Rol,
  accion:
    | "crearInsumo"
    | "editarInsumo"
    | "eliminarInsumo"
    | "crearProducto"
    | "editarProducto"
    | "actualizarPrecio"
    | "registrarMovimiento"
    | "transferirStock"
    | "verReportes"
    | "gestionarUsuarios"
): boolean {
  if (rol === "admin") return true; // admin puede todo

  // Empleado: solo lectura + registro de movimientos
  const permisosEmpleado: typeof accion[] = [
    "registrarMovimiento",
    "transferirStock",
    "verReportes",
  ];
  return permisosEmpleado.includes(accion);
}
