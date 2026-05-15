import { PrismaClient } from "@prisma/client";

// Singleton pattern para evitar que Next.js en hot-reload
// cree múltiples instancias de PrismaClient en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
