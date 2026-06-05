"use server";
 
// =====================================================
// SERVER ACTIONS - Mutaciones con autorización por rol
// =====================================================
 
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario, requireAdmin, puedeRealizar } from "@/lib/auth";
 
// ---------- Materias Primas (solo admin) ----------
 
export async function crearMateriaPrima(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No tienes permisos para crear insumos" };
  }
 
  const nombre = (formData.get("nombre") as string)?.trim();
  const unidad = formData.get("unidad") as string;
  const precioActual = Number(formData.get("precioActual"));
  const proveedor = (formData.get("proveedor") as string)?.trim();
 
  if (!nombre || !unidad || !proveedor) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (precioActual <= 0) {
    return { error: "El precio debe ser mayor a 0" };
  }
 
  try {
    await prisma.materiaPrima.create({
      data: { nombre, unidad, precioActual, proveedor },
    });
    revalidatePath("/materias-primas");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Ya existe un insumo con ese nombre" };
    }
    return { error: "Error al crear el insumo" };
  }
}
 
export async function actualizarPrecio(
  materiaPrimaId: string,
  nuevoPrecio: number
) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No tienes permisos para actualizar precios" };
  }
 
  if (nuevoPrecio <= 0) return { error: "El precio debe ser mayor a 0" };
 
  try {
    await prisma.$transaction([
      prisma.historialPrecio.create({
        data: { materiaPrimaId, precio: nuevoPrecio },
      }),
      prisma.materiaPrima.update({
        where: { id: materiaPrimaId },
        data: { precioActual: nuevoPrecio },
      }),
    ]);
    revalidatePath("/materias-primas");
    revalidatePath("/costos");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el precio" };
  }
}
 
export async function eliminarMateriaPrima(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No tienes permisos para eliminar insumos" };
  }
 
  try {
    const enUso = await prisma.ingrediente.findFirst({
      where: { materiaPrimaId: id },
    });
    if (enUso) {
      return {
        error: "No se puede eliminar: este insumo está en una receta activa",
      };
    }
 
    await prisma.materiaPrima.delete({ where: { id } });
    revalidatePath("/materias-primas");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el insumo" };
  }
}
 
// ---------- Movimientos (admin y empleado) ----------
 
export async function registrarMovimiento(formData: FormData) {
  let usuario;
  try {
    usuario = await requireUsuario();
  } catch {
    return { error: "Debes iniciar sesión" };
  }
 
  if (!puedeRealizar(usuario.rol, "registrarMovimiento")) {
    return { error: "No tienes permisos para registrar movimientos" };
  }
 
  const tipo = formData.get("tipo") as
    | "entrada"
    | "salida"
    | "traslado"
    | "produccion";
  const productoId = formData.get("productoId") as string;
  const cantidad = Number(formData.get("cantidad"));
  const unidad = formData.get("unidad") as string;
  const ubicacion = formData.get("ubicacion") as "planta" | "unicentro";
  const ubicacionDestino = formData.get("ubicacionDestino") as
    | "planta"
    | "unicentro"
    | null;
  const descripcion = formData.get("descripcion") as string | null;
 
  if (cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" };
  if (!productoId) return { error: "Debes seleccionar un producto" };
 
  try {
    await prisma.$transaction(async (tx: any) => {
      // ----- PRODUCCIÓN: descuenta insumos según receta -----
      if (tipo === "produccion") {
        const producto = await tx.producto.findUnique({
          where: { id: productoId },
          include: { receta: { include: { materiaPrima: true } } },
        });
 
        if (!producto) throw new Error("Producto no encontrado");
        if (producto.receta.length === 0) {
          throw new Error(
            "Este producto no tiene receta definida. No se puede producir."
          );
        }
 
        for (const ing of producto.receta) {
          const cantidadNecesaria = ing.cantidad * cantidad;
          const stockInsumo = await tx.stockInsumo.findUnique({
            where: {
              materiaPrimaId_ubicacion: {
                materiaPrimaId: ing.materiaPrimaId,
                ubicacion: "planta",
              },
            },
          });
 
          if (!stockInsumo || stockInsumo.cantidad < cantidadNecesaria) {
            throw new Error(
              `Insumo insuficiente: ${ing.materiaPrima.nombre}. ` +
                `Necesario: ${cantidadNecesaria} ${ing.unidad}, ` +
                `Disponible: ${stockInsumo?.cantidad ?? 0} ${ing.unidad}`
            );
          }
 
          await tx.stockInsumo.update({
            where: {
              materiaPrimaId_ubicacion: {
                materiaPrimaId: ing.materiaPrimaId,
                ubicacion: "planta",
              },
            },
            data: { cantidad: { decrement: cantidadNecesaria } },
          });
        }
 
        await tx.stockProducto.upsert({
          where: { productoId_ubicacion: { productoId, ubicacion } },
          update: { cantidad: { increment: cantidad } },
          create: { productoId, ubicacion, cantidad },
        });
 
        await tx.movimiento.create({
          data: {
            tipo,
            productoId,
            cantidad,
            unidad,
            ubicacion,
            descripcion:
              descripcion ?? `Producción de ${cantidad} unidades`,
            usuarioId: usuario!.id,
          },
        });
        return;
      }
 
      // ----- SALIDA y TRASLADO -----
      if (tipo === "salida" || tipo === "traslado") {
        const stockActual = await tx.stockProducto.findUnique({
          where: { productoId_ubicacion: { productoId, ubicacion } },
        });
        if (!stockActual || stockActual.cantidad < cantidad) {
          throw new Error(
            `Stock insuficiente en ${ubicacion}. Disponible: ${stockActual?.cantidad ?? 0}`
          );
        }
      }
 
      await tx.movimiento.create({
        data: {
          tipo,
          productoId,
          cantidad,
          unidad,
          ubicacion,
          ubicacionDestino,
          descripcion,
          usuarioId: usuario!.id,
        },
      });
 
      const delta = tipo === "entrada" ? cantidad : -cantidad;
 
      await tx.stockProducto.upsert({
        where: { productoId_ubicacion: { productoId, ubicacion } },
        update: { cantidad: { increment: delta } },
        create: {
          productoId,
          ubicacion,
          cantidad: Math.max(delta, 0),
        },
      });
 
      if (tipo === "traslado" && ubicacionDestino) {
        await tx.stockProducto.upsert({
          where: {
            productoId_ubicacion: { productoId, ubicacion: ubicacionDestino },
          },
          update: { cantidad: { increment: cantidad } },
          create: { productoId, ubicacion: ubicacionDestino, cantidad },
        });
      }
    });
 
    revalidatePath("/inventario");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Error al registrar el movimiento" };
  }
}
 
// ---------- Productos (solo admin) ----------
 
export async function crearProducto(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "No tienes permisos para crear productos" };
  }
 
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const stockMinimo = Number(formData.get("stockMinimo")) || 10;
  const costoManoObra = Number(formData.get("costoManoObra")) || 0;
  const costoFijo = Number(formData.get("costoFijo")) || 0;
  const costoVariable = Number(formData.get("costoVariable")) || 0;
  const recetaJson = formData.get("receta") as string;
 
  if (!nombre) return { error: "El nombre es obligatorio" };
  if (costoManoObra < 0 || costoFijo < 0 || costoVariable < 0) {
    return { error: "Los costos no pueden ser negativos" };
  }
 
  let receta: { materiaPrimaId: string; cantidad: number; unidad: string }[];
  try {
    receta = JSON.parse(recetaJson);
  } catch {
    return { error: "Receta inválida" };
  }
 
  if (receta.length === 0) {
    return { error: "El producto debe tener al menos un ingrediente" };
  }
 
  try {
    await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        stockMinimo,
        costoManoObra,
        costoFijo,
        costoVariable,
        receta: { create: receta },
      },
    });
    revalidatePath("/costos");
    revalidatePath("/inventario");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Ya existe un producto con ese nombre" };
    }
    return { error: "Error al crear el producto" };
  }
}
 
// ---------- Búsqueda ----------
export async function buscar(termino: string) {
  try {
    await requireUsuario();
  } catch {
    return [];
  }
  const { buscarGlobal } = await import("@/lib/services");
  return buscarGlobal(termino);
}

export async function registrarReempaque(formData: FormData) {
  let usuario;
  try {
    usuario = await requireUsuario();
  } catch {
    return { error: "Debes iniciar sesión" };
  }

  const productoFinalId = formData.get("productoFinalId") as string;
  const cantidad = Number(formData.get("cantidad"));
  const ubicacion = formData.get("ubicacion") as "planta" | "unicentro";
  const descripcion = formData.get("descripcion") as string | null;

  if (!productoFinalId) return { error: "Selecciona el producto a armar" };
  if (cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" };

  try {
    await prisma.$transaction(async (tx: any) => {
      // Obtener la receta de productos del producto final
      const recetaProductos = await tx.recetaProducto.findMany({
        where: { productoId: productoFinalId },
        include: { ingredienteProducto: true },
      });

      if (recetaProductos.length === 0) {
        throw new Error(
          "Este producto no tiene receta de reempaque definida"
        );
      }

      // Verificar y descontar stock de cada ingrediente-producto
      for (const r of recetaProductos) {
        const cantidadNecesaria = r.cantidad * cantidad;
        const stockIngrediente = await tx.stockProducto.findUnique({
          where: {
            productoId_ubicacion: {
              productoId: r.ingredienteProductoId,
              ubicacion,
            },
          },
        });

        if (
          !stockIngrediente ||
          stockIngrediente.cantidad < cantidadNecesaria
        ) {
          throw new Error(
            `Stock insuficiente de "${r.ingredienteProducto.nombre}". ` +
              `Necesario: ${cantidadNecesaria}, ` +
              `Disponible: ${stockIngrediente?.cantidad ?? 0}`
          );
        }

        // Descontar ingrediente
        await tx.stockProducto.update({
          where: {
            productoId_ubicacion: {
              productoId: r.ingredienteProductoId,
              ubicacion,
            },
          },
          data: { cantidad: { decrement: cantidadNecesaria } },
        });
      }

      // Sumar el producto final al inventario
      await tx.stockProducto.upsert({
        where: {
          productoId_ubicacion: { productoId: productoFinalId, ubicacion },
        },
        update: { cantidad: { increment: cantidad } },
        create: { productoId: productoFinalId, ubicacion, cantidad },
      });

      // Registrar como movimiento de producción
      await tx.movimiento.create({
        data: {
          tipo: "produccion",
          productoId: productoFinalId,
          cantidad,
          unidad: "und",
          ubicacion,
          descripcion: descripcion ?? `Reempaque: ${cantidad} unidades armadas`,
          usuarioId: usuario!.id,
        },
      });
    });

    revalidatePath("/inventario");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Error al registrar el reempaque" };
  }
}