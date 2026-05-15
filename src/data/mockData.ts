import type {
  MateriaPrima,
  Producto,
  StockProducto,
  Movimiento,
  KpiPanel,
  PuntoEvolucionCostos,
  HistorialPrecio,
} from "@/types";

// =====================================================
// MATERIAS PRIMAS
// =====================================================
export const materiasPrimas: MateriaPrima[] = [
  {
    id: "mp-001",
    nombre: "Base de Glicerina",
    unidad: "kg",
    precioActual: 25000,
    proveedor: "Químicos Valle",
    fechaActualizacion: "2026-04-15",
  },
  {
    id: "mp-002",
    nombre: "Aceite de Coco",
    unidad: "L",
    precioActual: 45000,
    proveedor: "Natura Oils",
    fechaActualizacion: "2026-04-10",
  },
  {
    id: "mp-003",
    nombre: "Aceite de Ricino",
    unidad: "L",
    precioActual: 55000,
    proveedor: "Natura Oils",
    fechaActualizacion: "2026-04-10",
  },
  {
    id: "mp-004",
    nombre: "Arroz Molido",
    unidad: "kg",
    precioActual: 6000,
    proveedor: "Granos Palmira",
    fechaActualizacion: "2026-04-05",
  },
  {
    id: "mp-005",
    nombre: "Esencia de Lavanda",
    unidad: "ml",
    precioActual: 800,
    proveedor: "Aromas y Sentidos",
    fechaActualizacion: "2026-04-18",
  },
  {
    id: "mp-006",
    nombre: "Manteca de Karité",
    unidad: "kg",
    precioActual: 85000,
    proveedor: "BioCosmetics",
    fechaActualizacion: "2026-04-12",
  },
  {
    id: "mp-007",
    nombre: "Miel de Abeja",
    unidad: "L",
    precioActual: 35000,
    proveedor: "Apícola San Juan",
    fechaActualizacion: "2026-04-08",
  },
  {
    id: "mp-008",
    nombre: "Avena en Hojuelas",
    unidad: "kg",
    precioActual: 12000,
    proveedor: "Granos Palmira",
    fechaActualizacion: "2026-04-05",
  },
  {
    id: "mp-009",
    nombre: "Azúcar Blanca",
    unidad: "kg",
    precioActual: 5000,
    proveedor: "Distribuidora Central",
    fechaActualizacion: "2026-04-02",
  },
];

// =====================================================
// HISTORIAL DE PRECIOS (para restricción 6F)
// =====================================================
export const historialPrecios: HistorialPrecio[] = [
  { id: "hp-001", materiaPrimaId: "mp-001", precio: 22000, fecha: "2026-01-15" },
  { id: "hp-002", materiaPrimaId: "mp-001", precio: 23500, fecha: "2026-02-15" },
  { id: "hp-003", materiaPrimaId: "mp-001", precio: 24000, fecha: "2026-03-15" },
  { id: "hp-004", materiaPrimaId: "mp-001", precio: 25000, fecha: "2026-04-15" },
];

// =====================================================
// PRODUCTOS CON SUS RECETAS
// =====================================================
export const productos: Producto[] = [
  {
    id: "prod-001",
    nombre: "Jabón de Glicerina y Lavanda",
    descripcion: "Receta estándar y desglose de costos",
    costoActual: 9300,
    variacionMensual: 9.4,
    stockMinimo: 30,
    receta: [
      { materiaPrimaId: "mp-001", nombre: "Base de Glicerina", cantidad: 0.1, unidad: "kg", precioUnitario: 25000 },
      { materiaPrimaId: "mp-005", nombre: "Esencia de Lavanda", cantidad: 5, unidad: "ml", precioUnitario: 800 },
      { materiaPrimaId: "mp-006", nombre: "Manteca de Karité", cantidad: 0.02, unidad: "kg", precioUnitario: 85000 },
      { materiaPrimaId: "empaque-001", nombre: "Etiqueta Jabón", cantidad: 1, unidad: "und", precioUnitario: 300 },
      { materiaPrimaId: "empaque-002", nombre: "Empaque Biodegradable", cantidad: 1, unidad: "und", precioUnitario: 800 },
    ],
  },
  {
    id: "prod-002",
    nombre: "Vela Aromática de Coco",
    costoActual: 21100,
    variacionMensual: 3.2,
    stockMinimo: 25,
    receta: [
      { materiaPrimaId: "mp-002", nombre: "Aceite de Coco", cantidad: 0.3, unidad: "L", precioUnitario: 45000 },
      { materiaPrimaId: "mp-005", nombre: "Esencia de Lavanda", cantidad: 10, unidad: "ml", precioUnitario: 800 },
      { materiaPrimaId: "empaque-003", nombre: "Recipiente de Vidrio", cantidad: 1, unidad: "und", precioUnitario: 3500 },
    ],
  },
  {
    id: "prod-003",
    nombre: "Jabón de Avena y Miel",
    costoActual: 4485,
    variacionMensual: -1.2,
    stockMinimo: 40,
    receta: [
      { materiaPrimaId: "mp-001", nombre: "Base de Glicerina", cantidad: 0.1, unidad: "kg", precioUnitario: 25000 },
      { materiaPrimaId: "mp-008", nombre: "Avena en Hojuelas", cantidad: 0.015, unidad: "kg", precioUnitario: 12000 },
      { materiaPrimaId: "mp-007", nombre: "Miel de Abeja", cantidad: 0.01, unidad: "L", precioUnitario: 35000 },
      { materiaPrimaId: "empaque-001", nombre: "Etiqueta Jabón", cantidad: 1, unidad: "und", precioUnitario: 300 },
    ],
  },
  {
    id: "prod-004",
    nombre: "Exfoliante de Azúcar",
    costoActual: 7900,
    variacionMensual: 2.1,
    stockMinimo: 20,
    receta: [
      { materiaPrimaId: "mp-009", nombre: "Azúcar Blanca", cantidad: 0.1, unidad: "kg", precioUnitario: 5000 },
      { materiaPrimaId: "mp-002", nombre: "Aceite de Coco", cantidad: 0.05, unidad: "L", precioUnitario: 45000 },
      { materiaPrimaId: "mp-005", nombre: "Esencia de Lavanda", cantidad: 6, unidad: "ml", precioUnitario: 800 },
    ],
  },
  {
    id: "prod-005",
    nombre: "Crema Facial Natural",
    costoActual: 13300,
    variacionMensual: 5.5,
    stockMinimo: 20,
    receta: [
      { materiaPrimaId: "mp-006", nombre: "Manteca de Karité", cantidad: 0.05, unidad: "kg", precioUnitario: 85000 },
      { materiaPrimaId: "mp-003", nombre: "Aceite de Ricino", cantidad: 0.1, unidad: "L", precioUnitario: 55000 },
      { materiaPrimaId: "mp-004", nombre: "Arroz Molido", cantidad: 0.02, unidad: "kg", precioUnitario: 6000 },
    ],
  },
];

// =====================================================
// INVENTARIO POR UBICACIÓN
// =====================================================
export const stockProductos: StockProducto[] = [
  {
    productoId: "prod-001",
    nombre: "Jabón de Glicerina y Lavanda",
    stockMinimo: 30,
    stockPlanta: 80,
    stockUnicentro: 15,
  },
  {
    productoId: "prod-002",
    nombre: "Vela Aromática de Coco",
    stockMinimo: 25,
    stockPlanta: 12,
    stockUnicentro: 8,
  },
  {
    productoId: "prod-003",
    nombre: "Jabón de Avena y Miel",
    stockMinimo: 40,
    stockPlanta: 45,
    stockUnicentro: 22,
  },
  {
    productoId: "prod-004",
    nombre: "Exfoliante de Azúcar",
    stockMinimo: 20,
    stockPlanta: 10,
    stockUnicentro: 5,
  },
  {
    productoId: "prod-005",
    nombre: "Crema Facial Natural",
    stockMinimo: 20,
    stockPlanta: 30,
    stockUnicentro: 12,
  },
  {
    productoId: "mp-001",
    nombre: "Base de Glicerina (kg)",
    stockMinimo: 20,
    stockPlanta: 15,
    stockUnicentro: 0,
    esInsumo: true,
    unidad: "kg",
  },
  {
    productoId: "mp-002",
    nombre: "Aceite de Coco (L)",
    stockMinimo: 10,
    stockPlanta: 8,
    stockUnicentro: 0,
    esInsumo: true,
    unidad: "L",
  },
];

// =====================================================
// ÚLTIMOS MOVIMIENTOS
// =====================================================
export const ultimosMovimientos: Movimiento[] = [
  {
    id: "mov-001",
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tipo: "entrada",
    productoNombre: "Base de Glicerina",
    cantidad: 20,
    unidad: "kg",
    ubicacion: "planta",
    descripcion: "Entrada · 20 kg",
  },
  {
    id: "mov-002",
    fecha: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    tipo: "traslado",
    productoNombre: "Jabón de Avena y Miel",
    cantidad: 50,
    unidad: "und",
    descripcion: "Traslado · 50 und",
  },
  {
    id: "mov-003",
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tipo: "produccion",
    productoNombre: "Velas de Coco",
    cantidad: 30,
    unidad: "und",
    ubicacion: "planta",
    descripcion: "Producción · 30 und",
  },
  {
    id: "mov-004",
    fecha: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    tipo: "salida",
    productoNombre: "Exfoliante de Azúcar",
    cantidad: 15,
    unidad: "und",
    ubicacion: "unicentro",
    descripcion: "Salida · 15 und",
  },
];

// =====================================================
// KPIs DASHBOARD
// =====================================================
export const kpiPanel: KpiPanel = {
  insumosRegistrados: 42,
  costoProduccionDia: 1450000,
  costoProduccionDiaVariacion: 1.2,
  productosEnInventario: 1250,
  productosEnInventarioVariacion: 5.4,
  alertasPendientes: 4,
};

// =====================================================
// EVOLUCIÓN DE COSTOS (últimos 6 meses)
// =====================================================
export const evolucionCostos: PuntoEvolucionCostos[] = [
  { mes: "Ene", costo: 1280000 },
  { mes: "Feb", costo: 1310000 },
  { mes: "Mar", costo: 1350000 },
  { mes: "Abr", costo: 1340000 },
  { mes: "May", costo: 1395000 },
  { mes: "Jun", costo: 1450000 },
];
