// =====================================================
// CAPA DE SERVICIOS - Acceso a datos vía Prisma
// =====================================================
 
import { prisma } from "@/lib/prisma";
import type {
  MateriaPrima,
  Producto,
  StockProducto,
  Movimiento,
  KpiPanel,
  PuntoEvolucionCostos,
  HistorialPrecio,
  UnidadMedida,
} from "@/types";
 
// ---------- Materias Primas ----------
export async function getMateriasPrimas(): Promise<MateriaPrima[]> {
  const rows = await prisma.materiaPrima.findMany({
    orderBy: { nombre: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    unidad: m.unidad as UnidadMedida,
    precioActual: m.precioActual,
    proveedor: m.proveedor,
    fechaActualizacion: m.fechaActualizacion.toISOString(),
  }));
}
 
export async function getMateriaPrimaById(id: string): Promise<MateriaPrima | null> {
  const m = await prisma.materiaPrima.findUnique({ where: { id } });
  if (!m) return null;
  return {
    id: m.id,
    nombre: m.nombre,
    unidad: m.unidad as UnidadMedida,
    precioActual: m.precioActual,
    proveedor: m.proveedor,
    fechaActualizacion: m.fechaActualizacion.toISOString(),
  };
}
 
export async function getHistorialPrecios(materiaPrimaId: string): Promise<HistorialPrecio[]> {
  const rows = await prisma.historialPrecio.findMany({
    where: { materiaPrimaId },
    orderBy: { fecha: "desc" },
  });
  return rows.map((h) => ({
    id: h.id,
    materiaPrimaId: h.materiaPrimaId,
    precio: h.precio,
    fecha: h.fecha.toISOString(),
  }));
}
 
// ---------- Productos ----------
export async function getProductos(): Promise<Producto[]> {
  const productos = await prisma.producto.findMany({
  where: { activo: true },
  include: {
    receta: {
      include: {
        materiaPrima: true,
      },
    },
    recetasComoBase: {
      include: {
        ingredienteProducto: true,
      },
    },
  },
  orderBy: {
    nombre: "asc",
  },
});

  return productos.map((p) => {
    const receta = p.receta.map((ing) => ({
      materiaPrimaId: ing.materiaPrimaId,
      nombre: ing.materiaPrima.nombre,
      cantidad: ing.cantidad,
      unidad: ing.unidad as UnidadMedida,
      precioUnitario: ing.materiaPrima.precioActual,
    }));

    const recetaProductos = p.recetasComoBase.map((r) => ({
      id: r.id,
      productoId: r.productoId,
      ingredienteProductoId: r.ingredienteProductoId,
      ingredienteNombre: r.ingredienteProducto.nombre,
      cantidad: r.cantidad,
      unidad: r.unidad as UnidadMedida,
    }));

    const costoInsumos = receta.reduce(
      (acc, ing) => acc + ing.cantidad * ing.precioUnitario,
      0
    );

    const costoActual =
      costoInsumos +
      p.costoManoObra +
      p.costoFijo +
      p.costoVariable;

    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? undefined,
      costoActual,
      costoInsumos,
      costoManoObra: p.costoManoObra,
      costoFijo: p.costoFijo,
      costoVariable: p.costoVariable,
      variacionMensual: 0,
      stockMinimo: p.stockMinimo,
      receta,
      recetaProductos,
    };
  });
}
 
export async function getProductoById(
  id: string
): Promise<Producto | null> {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: {
      receta: {
        include: {
          materiaPrima: true,
        },
      },
      recetasComoBase: {
        include: {
          ingredienteProducto: true,
        },
      },
    },
  });

  if (!p) return null;

  const receta = p.receta.map((ing) => ({
    materiaPrimaId: ing.materiaPrimaId,
    nombre: ing.materiaPrima.nombre,
    cantidad: ing.cantidad,
    unidad: ing.unidad as UnidadMedida,
    precioUnitario: ing.materiaPrima.precioActual,
  }));

  const recetaProductos = p.recetasComoBase.map((r) => ({
    id: r.id,
    productoId: r.productoId,
    ingredienteProductoId: r.ingredienteProductoId,
    ingredienteNombre: r.ingredienteProducto.nombre,
    cantidad: r.cantidad,
    unidad: r.unidad as UnidadMedida,
  }));

  const costoInsumos = receta.reduce(
    (acc, ing) => acc + ing.cantidad * ing.precioUnitario,
    0
  );

  const costoActual =
    costoInsumos +
    p.costoManoObra +
    p.costoFijo +
    p.costoVariable;

  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? undefined,
    costoActual,
    costoInsumos,
    costoManoObra: p.costoManoObra,
    costoFijo: p.costoFijo,
    costoVariable: p.costoVariable,
    variacionMensual: 0,
    stockMinimo: p.stockMinimo,
    receta,
    recetaProductos,
  };
}
 
// ---------- Inventario ----------
export async function getStockProductos(): Promise<StockProducto[]> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { stockProducto: true },
    orderBy: { nombre: "asc" },
  });
 
  return productos.map((p) => {
    const planta = p.stockProducto.find((s) => s.ubicacion === "planta");
    const unicentro = p.stockProducto.find((s) => s.ubicacion === "unicentro");
    return {
      productoId: p.id,
      nombre: p.nombre,
      stockMinimo: p.stockMinimo,
      stockPlanta: planta?.cantidad ?? 0,
      stockUnicentro: unicentro?.cantidad ?? 0,
    };
  });
}
 
export async function getStockPorUbicacion() {
  const stock = await getStockProductos();
  const stockPlanta = stock.reduce((acc, s) => acc + s.stockPlanta, 0);
  const stockUnicentro = stock.reduce((acc, s) => acc + s.stockUnicentro, 0);
  return {
    stockPlanta,
    stockUnicentro,
    stockTotal: stockPlanta + stockUnicentro,
  };
}
 
export async function getAlertasStock(): Promise<
  { id: string; productoNombre: string; stockActual: number; stockMinimo: number }[]
> {
  const stock = await getStockProductos();
  return stock
    .map((s) => ({
      id: s.productoId,
      productoNombre: s.nombre,
      stockActual: s.stockPlanta + s.stockUnicentro,
      stockMinimo: s.stockMinimo,
    }))
    .filter((s) => s.stockActual < s.stockMinimo);
}
 
// ---------- Movimientos ----------
export async function getUltimosMovimientos(limit = 4): Promise<Movimiento[]> {
  const rows = await prisma.movimiento.findMany({
    orderBy: { fecha: "desc" },
    take: limit,
    include: { producto: true },
  });
 
  return rows.map((m) => ({
    id: m.id,
    fecha: m.fecha.toISOString(),
    tipo: m.tipo as Movimiento["tipo"],
    productoNombre: m.producto?.nombre ?? "Producto",
    cantidad: m.cantidad,
    unidad: m.unidad as UnidadMedida,
    ubicacion: m.ubicacion as Movimiento["ubicacion"],
    descripcion: m.descripcion ?? undefined,
  }));
}
 
export async function getTodosMovimientos(): Promise<Movimiento[]> {
  const rows = await prisma.movimiento.findMany({
    orderBy: { fecha: "desc" },
    include: { producto: true },
  });
 
  return rows.map((m) => ({
    id: m.id,
    fecha: m.fecha.toISOString(),
    tipo: m.tipo as Movimiento["tipo"],
    productoNombre: m.producto?.nombre ?? "Producto",
    cantidad: m.cantidad,
    unidad: m.unidad as UnidadMedida,
    ubicacion: m.ubicacion as Movimiento["ubicacion"],
    descripcion: m.descripcion ?? undefined,
  }));
}
 
// ---------- Dashboard ----------
export async function getKpiPanel(): Promise<KpiPanel> {
  const [insumos, productos, stock] = await Promise.all([
    prisma.materiaPrima.count(),
    getProductos(),
    getStockPorUbicacion(),
  ]);
 
  const alertas = (await getStockProductos()).filter(
    (s) => s.stockPlanta + s.stockUnicentro < s.stockMinimo
  ).length;
 
  const costoProduccionDia = productos.reduce(
    (acc, p) => acc + p.costoActual,
    0
  );
 
  return {
    insumosRegistrados: insumos,
    costoProduccionDia,
    costoProduccionDiaVariacion: 0,
    productosEnInventario: stock.stockTotal,
    productosEnInventarioVariacion: 0,
    alertasPendientes: alertas,
  };
}
 
export async function getEvolucionCostos(): Promise<PuntoEvolucionCostos[]> {
  const productos = await getProductos();
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const ahora = new Date();
  const datos: PuntoEvolucionCostos[] = [];
 
  if (productos.length === 0) {
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      datos.push({ mes: meses[fecha.getMonth()], costo: 0 });
    }
    return datos;
  }
 
  const costoActual = productos.reduce((acc, p) => acc + p.costoActual, 0);
 
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const variacion = 1 - i * 0.02;
    datos.push({
      mes: meses[fecha.getMonth()],
      costo: Math.round(costoActual * variacion),
    });
  }
  return datos;
}
 
// ---------- Búsqueda global ----------
export async function buscarGlobal(
  termino: string
): Promise<
  { tipo: "insumo" | "producto"; id: string; nombre: string; detalle: string }[]
> {
  if (!termino || termino.length < 2) return [];
 
  const [insumos, productos] = await Promise.all([
    prisma.materiaPrima.findMany({
      where: { nombre: { contains: termino, mode: "insensitive" } },
      take: 5,
    }),
    prisma.producto.findMany({
      where: {
        nombre: { contains: termino, mode: "insensitive" },
        activo: true,
      },
      take: 5,
    }),
  ]);
 
  return [
    ...insumos.map((m) => ({
      tipo: "insumo" as const,
      id: m.id,
      nombre: m.nombre,
      detalle: `${m.proveedor} · ${m.unidad}`,
    })),
    ...productos.map((p) => ({
      tipo: "producto" as const,
      id: p.id,
      nombre: p.nombre,
      detalle: p.descripcion ?? "Producto terminado",
    })),
  ];
}
 
export function calcularCostoProducto(producto: Producto): number {
  const costoInsumos = producto.receta.reduce(
    (acc, ing) => acc + ing.cantidad * ing.precioUnitario,
    0
  );
  return (
    costoInsumos +
    producto.costoManoObra +
    producto.costoFijo +
    producto.costoVariable
  );
}