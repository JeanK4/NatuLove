"use server";

import { requireUsuario } from "@/lib/auth";
import {
  getMateriasPrimas,
  getProductos,
  getStockProductos,
  getTodosMovimientos,
  getKpiPanel,
} from "@/lib/services";
import { formatCOP } from "@/lib/format";

interface ReporteData {
  filename: string;
  base64: string;
  mimeType: string;
}

/**
 * Genera un reporte Excel con todos los datos del sistema.
 */
export async function generarReporteExcel(): Promise<ReporteData> {
  await requireUsuario();

  const ExcelJS = (await import("exceljs")).default;
  const [materias, productos, stock, movimientos, kpi] = await Promise.all([
    getMateriasPrimas(),
    getProductos(),
    getStockProductos(),
    getTodosMovimientos(),
    getKpiPanel(),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Natu Love";
  wb.created = new Date();

  // Estilo de encabezados
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "FF16A34A" },
    },
    alignment: { horizontal: "center" as const, vertical: "middle" as const },
  };

  // ----- HOJA 1: Resumen -----
  const wsResumen = wb.addWorksheet("Resumen");
  wsResumen.columns = [
    { header: "Indicador", key: "ind", width: 32 },
    { header: "Valor", key: "val", width: 24 },
  ];
  wsResumen.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  wsResumen.addRow({ ind: "Insumos registrados", val: kpi.insumosRegistrados });
  wsResumen.addRow({
    ind: "Costo de producción del día",
    val: formatCOP(kpi.costoProduccionDia),
  });
  wsResumen.addRow({
    ind: "Productos en inventario",
    val: kpi.productosEnInventario,
  });
  wsResumen.addRow({
    ind: "Alertas pendientes",
    val: kpi.alertasPendientes,
  });
  wsResumen.addRow({});
  wsResumen.addRow({
    ind: "Generado",
    val: new Date().toLocaleString("es-CO"),
  });

  // ----- HOJA 2: Materias Primas -----
  const wsMaterias = wb.addWorksheet("Materias Primas");
  wsMaterias.columns = [
    { header: "Nombre", key: "nombre", width: 30 },
    { header: "Unidad", key: "unidad", width: 10 },
    { header: "Precio Actual", key: "precio", width: 18 },
    { header: "Proveedor", key: "proveedor", width: 25 },
    { header: "Última actualización", key: "fecha", width: 22 },
  ];
  wsMaterias.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  materias.forEach((m) => {
    wsMaterias.addRow({
      nombre: m.nombre,
      unidad: m.unidad,
      precio: formatCOP(m.precioActual),
      proveedor: m.proveedor,
      fecha: new Date(m.fechaActualizacion).toLocaleDateString("es-CO"),
    });
  });

  // ----- HOJA 3: Productos y Costos -----
  const wsProductos = wb.addWorksheet("Productos");
  wsProductos.columns = [
    { header: "Producto", key: "nombre", width: 32 },
    { header: "Costo Calculado", key: "costo", width: 18 },
    { header: "Stock Mínimo", key: "min", width: 14 },
    { header: "Ingredientes", key: "ing", width: 60 },
  ];
  wsProductos.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  productos.forEach((p) => {
    const ingredientes = p.receta
      .map((i) => `${i.nombre} (${i.cantidad} ${i.unidad})`)
      .join(", ");
    wsProductos.addRow({
      nombre: p.nombre,
      costo: formatCOP(p.costoActual),
      min: p.stockMinimo,
      ing: ingredientes || "Sin receta",
    });
  });

  // ----- HOJA 4: Inventario -----
  const wsStock = wb.addWorksheet("Inventario");
  wsStock.columns = [
    { header: "Producto", key: "nombre", width: 32 },
    { header: "Mínimo Ideal", key: "min", width: 14 },
    { header: "Stock Planta", key: "planta", width: 14 },
    { header: "Stock Unicentro", key: "uni", width: 16 },
    { header: "Total", key: "total", width: 12 },
    { header: "Estado", key: "estado", width: 16 },
  ];
  wsStock.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  stock.forEach((s) => {
    const total = s.stockPlanta + s.stockUnicentro;
    const critico = total < s.stockMinimo;
    wsStock.addRow({
      nombre: s.nombre,
      min: s.stockMinimo,
      planta: s.stockPlanta,
      uni: s.stockUnicentro,
      total,
      estado: critico ? "🔴 Crítico" : "🟢 OK",
    });
  });

  // ----- HOJA 5: Movimientos -----
  const wsMovs = wb.addWorksheet("Movimientos");
  wsMovs.columns = [
    { header: "Fecha", key: "fecha", width: 22 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Producto", key: "producto", width: 30 },
    { header: "Cantidad", key: "cantidad", width: 12 },
    { header: "Unidad", key: "unidad", width: 10 },
    { header: "Ubicación", key: "ub", width: 14 },
    { header: "Descripción", key: "desc", width: 35 },
  ];
  wsMovs.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  movimientos.forEach((m) => {
    wsMovs.addRow({
      fecha: new Date(m.fecha).toLocaleString("es-CO"),
      tipo: m.tipo,
      producto: m.productoNombre,
      cantidad: m.cantidad,
      unidad: m.unidad,
      ub: m.ubicacion ?? "",
      desc: m.descripcion ?? "",
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return {
    filename: `Natu_Love_Reporte_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`,
    base64,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

/**
 * Genera un reporte PDF resumen.
 */
export async function generarReportePDF(): Promise<ReporteData> {
  await requireUsuario();

  const { default: jsPDF } = await import("jspdf");
  const autoTableMod = await import("jspdf-autotable");
  const autoTable = (autoTableMod as any).default;

  const [materias, productos, stock, kpi] = await Promise.all([
    getMateriasPrimas(),
    getProductos(),
    getStockProductos(),
    getKpiPanel(),
  ]);

  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Portada / encabezado
  doc.setFontSize(22);
  doc.setTextColor(22, 163, 74);
  doc.text("Natu Love", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Reporte de Operaciones", 14, 28);
  doc.setFontSize(9);
  doc.text(`Generado: ${fecha}`, 14, 34);

  // Resumen
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Resumen", 14, 46);
  autoTable(doc, {
    startY: 50,
    head: [["Indicador", "Valor"]],
    body: [
      ["Insumos registrados", String(kpi.insumosRegistrados)],
      ["Costo de producción del día", formatCOP(kpi.costoProduccionDia)],
      ["Productos en inventario", String(kpi.productosEnInventario)],
      ["Alertas pendientes", String(kpi.alertasPendientes)],
    ],
    theme: "grid",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  });

  // Materias primas
  doc.setFontSize(14);
  doc.text("Materias Primas", 14, (doc as any).lastAutoTable.finalY + 14);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 18,
    head: [["Nombre", "Unidad", "Precio", "Proveedor"]],
    body: materias.map((m) => [
      m.nombre,
      m.unidad,
      formatCOP(m.precioActual),
      m.proveedor,
    ]),
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  });

  // Productos
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Productos y Costos", 14, 20);
  autoTable(doc, {
    startY: 26,
    head: [["Producto", "Costo", "Stock Mín."]],
    body: productos.map((p) => [
      p.nombre,
      formatCOP(p.costoActual),
      String(p.stockMinimo),
    ]),
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  });

  // Inventario
  doc.setFontSize(14);
  doc.text("Inventario", 14, (doc as any).lastAutoTable.finalY + 14);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 18,
    head: [["Producto", "Planta", "Unicentro", "Total", "Estado"]],
    body: stock.map((s) => {
      const total = s.stockPlanta + s.stockUnicentro;
      return [
        s.nombre,
        String(s.stockPlanta),
        String(s.stockUnicentro),
        String(total),
        total < s.stockMinimo ? "Crítico" : "OK",
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  });

  const blob = doc.output("arraybuffer");
  const base64 = Buffer.from(blob).toString("base64");

  return {
    filename: `Natu_Love_Reporte_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`,
    base64,
    mimeType: "application/pdf",
  };
}
