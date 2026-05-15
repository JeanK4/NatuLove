// =====================================================
// Script de seed: carga datos iniciales en la DB
// Ejecutar con: npx prisma db seed
// =====================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Limpiar (en orden inverso por las foreign keys)
  await prisma.movimiento.deleteMany();
  await prisma.stockProducto.deleteMany();
  await prisma.stockInsumo.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.historialPrecio.deleteMany();
  await prisma.materiaPrima.deleteMany();

  // -------- MATERIAS PRIMAS --------
  const baseGlicerina = await prisma.materiaPrima.create({
    data: {
      nombre: "Base de Glicerina",
      unidad: "kg",
      precioActual: 25000,
      proveedor: "Químicos Valle",
    },
  });

  const aceiteCoco = await prisma.materiaPrima.create({
    data: {
      nombre: "Aceite de Coco",
      unidad: "L",
      precioActual: 45000,
      proveedor: "Natura Oils",
    },
  });

  const aceiteRicino = await prisma.materiaPrima.create({
    data: {
      nombre: "Aceite de Ricino",
      unidad: "L",
      precioActual: 55000,
      proveedor: "Natura Oils",
    },
  });

  const arrozMolido = await prisma.materiaPrima.create({
    data: {
      nombre: "Arroz Molido",
      unidad: "kg",
      precioActual: 6000,
      proveedor: "Granos Palmira",
    },
  });

  const esenciaLavanda = await prisma.materiaPrima.create({
    data: {
      nombre: "Esencia de Lavanda",
      unidad: "ml",
      precioActual: 800,
      proveedor: "Aromas y Sentidos",
    },
  });

  const mantecaKarite = await prisma.materiaPrima.create({
    data: {
      nombre: "Manteca de Karité",
      unidad: "kg",
      precioActual: 85000,
      proveedor: "BioCosmetics",
    },
  });

  const mielAbeja = await prisma.materiaPrima.create({
    data: {
      nombre: "Miel de Abeja",
      unidad: "L",
      precioActual: 35000,
      proveedor: "Apícola San Juan",
    },
  });

  const avena = await prisma.materiaPrima.create({
    data: {
      nombre: "Avena en Hojuelas",
      unidad: "kg",
      precioActual: 12000,
      proveedor: "Granos Palmira",
    },
  });

  const azucar = await prisma.materiaPrima.create({
    data: {
      nombre: "Azúcar Blanca",
      unidad: "kg",
      precioActual: 5000,
      proveedor: "Distribuidora Central",
    },
  });

  console.log("✅ Materias primas creadas");

  // -------- HISTORIAL DE PRECIOS (ejemplo para Base de Glicerina) --------
  await prisma.historialPrecio.createMany({
    data: [
      { materiaPrimaId: baseGlicerina.id, precio: 22000, fecha: new Date("2026-01-15") },
      { materiaPrimaId: baseGlicerina.id, precio: 23500, fecha: new Date("2026-02-15") },
      { materiaPrimaId: baseGlicerina.id, precio: 24000, fecha: new Date("2026-03-15") },
      { materiaPrimaId: baseGlicerina.id, precio: 25000, fecha: new Date("2026-04-15") },
    ],
  });

  // -------- PRODUCTOS CON RECETAS --------
  await prisma.producto.create({
    data: {
      nombre: "Jabón de Glicerina y Lavanda",
      descripcion: "Receta estándar y desglose de costos",
      stockMinimo: 30,
      receta: {
        create: [
          { materiaPrimaId: baseGlicerina.id, cantidad: 0.1, unidad: "kg" },
          { materiaPrimaId: esenciaLavanda.id, cantidad: 5, unidad: "ml" },
          { materiaPrimaId: mantecaKarite.id, cantidad: 0.02, unidad: "kg" },
        ],
      },
      stockProducto: {
        create: [
          { ubicacion: "planta", cantidad: 80 },
          { ubicacion: "unicentro", cantidad: 15 },
        ],
      },
    },
  });

  await prisma.producto.create({
    data: {
      nombre: "Vela Aromática de Coco",
      stockMinimo: 25,
      receta: {
        create: [
          { materiaPrimaId: aceiteCoco.id, cantidad: 0.3, unidad: "L" },
          { materiaPrimaId: esenciaLavanda.id, cantidad: 10, unidad: "ml" },
        ],
      },
      stockProducto: {
        create: [
          { ubicacion: "planta", cantidad: 12 },
          { ubicacion: "unicentro", cantidad: 8 },
        ],
      },
    },
  });

  await prisma.producto.create({
    data: {
      nombre: "Jabón de Avena y Miel",
      stockMinimo: 40,
      receta: {
        create: [
          { materiaPrimaId: baseGlicerina.id, cantidad: 0.1, unidad: "kg" },
          { materiaPrimaId: avena.id, cantidad: 0.015, unidad: "kg" },
          { materiaPrimaId: mielAbeja.id, cantidad: 0.01, unidad: "L" },
        ],
      },
      stockProducto: {
        create: [
          { ubicacion: "planta", cantidad: 45 },
          { ubicacion: "unicentro", cantidad: 22 },
        ],
      },
    },
  });

  await prisma.producto.create({
    data: {
      nombre: "Exfoliante de Azúcar",
      stockMinimo: 20,
      receta: {
        create: [
          { materiaPrimaId: azucar.id, cantidad: 0.1, unidad: "kg" },
          { materiaPrimaId: aceiteCoco.id, cantidad: 0.05, unidad: "L" },
          { materiaPrimaId: esenciaLavanda.id, cantidad: 6, unidad: "ml" },
        ],
      },
      stockProducto: {
        create: [
          { ubicacion: "planta", cantidad: 10 },
          { ubicacion: "unicentro", cantidad: 5 },
        ],
      },
    },
  });

  await prisma.producto.create({
    data: {
      nombre: "Crema Facial Natural",
      stockMinimo: 20,
      receta: {
        create: [
          { materiaPrimaId: mantecaKarite.id, cantidad: 0.05, unidad: "kg" },
          { materiaPrimaId: aceiteRicino.id, cantidad: 0.1, unidad: "L" },
          { materiaPrimaId: arrozMolido.id, cantidad: 0.02, unidad: "kg" },
        ],
      },
      stockProducto: {
        create: [
          { ubicacion: "planta", cantidad: 30 },
          { ubicacion: "unicentro", cantidad: 12 },
        ],
      },
    },
  });

  console.log("✅ Productos y recetas creadas");

  // -------- STOCK DE INSUMOS --------
  await prisma.stockInsumo.create({
    data: {
      materiaPrimaId: baseGlicerina.id,
      ubicacion: "planta",
      cantidad: 15,
    },
  });

  await prisma.stockInsumo.create({
    data: {
      materiaPrimaId: aceiteCoco.id,
      ubicacion: "planta",
      cantidad: 8,
    },
  });

  console.log("✅ Stock de insumos creado");
  console.log("🎉 Seeding completo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
