// =====================================================
// Tipos de dominio para Natu Love
// Diseñados para mapear directamente a tablas SQL
// =====================================================
 
export type UnidadMedida = "kg" | "g" | "L" | "ml" | "und";
 
export type TipoMovimiento = "entrada" | "salida" | "traslado" | "produccion";
 
export type Ubicacion = "planta" | "unicentro";
 
// ----------- Materias Primas / Insumos -----------
export interface MateriaPrima {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  precioActual: number;
  proveedor: string;
  fechaActualizacion: string;
}
 
export interface HistorialPrecio {
  id: string;
  materiaPrimaId: string;
  precio: number;
  fecha: string;
}
 
// ----------- Productos y Recetas -----------
export interface Ingrediente {
  materiaPrimaId: string;
  nombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  precioUnitario: number;
}
 
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  costoActual: number;       // total = insumos + manoObra + fijo + variable
  costoInsumos: number;      // solo insumos (calculado de la receta)
  costoManoObra: number;
  costoFijo: number;
  costoVariable: number;
  variacionMensual: number;
  stockMinimo: number;
  receta: Ingrediente[];
}
 
// ----------- Inventario -----------
export interface StockProducto {
  productoId: string;
  nombre: string;
  stockMinimo: number;
  stockPlanta: number;
  stockUnicentro: number;
  esInsumo?: boolean;
  unidad?: UnidadMedida;
}
 
export interface Movimiento {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  productoNombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  ubicacion?: Ubicacion;
  descripcion?: string;
}
 
// ----------- Dashboard -----------
export interface KpiPanel {
  insumosRegistrados: number;
  costoProduccionDia: number;
  costoProduccionDiaVariacion: number;
  productosEnInventario: number;
  productosEnInventarioVariacion: number;
  alertasPendientes: number;
}
 
export interface PuntoEvolucionCostos {
  mes: string;
  costo: number;
}