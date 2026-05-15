# 🌿 Natu Love · Sistema de Gestión

Aplicación web para la gestión de costos de producción e inventario de **Natu Love**, tienda de cosmética natural y jabones artesanales en Palmira, Valle del Cauca.

## ✨ Funcionalidades

- **Login con Supabase Auth** (email + contraseña)
- **Roles:** Admin (Melanie) y Empleado
- **Panel principal** con KPIs en tiempo real
- **Materias primas** con historial de precios automático
- **Costos de producción** que se recalculan al cambiar precios de insumos
- **Inventario por ubicación** (Planta y Unicentro) con alertas de stock crítico
- **Movimientos:** entrada, salida, traslado y producción (descuenta insumos automáticamente)
- **Búsqueda global** desde la barra superior
- **Notificaciones** de stock crítico en la campana
- **Reportes descargables** en Excel y PDF

## 🚀 Setup inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (ver SETUP.md)
# Necesitas crear un .env con tus claves de Supabase

# 3. Crear las tablas en Supabase
npx prisma db push

# 4. Arrancar la app
npm run dev
```

## 📚 Guías

- **`SETUP.md`** → Cómo configurar Supabase desde cero (Auth + DB)
- **`USUARIOS.md`** → Cómo crear el primer admin y gestionar roles

## 🗂️ Estructura

```
src/
├── app/
│   ├── (auth)/              # Login y registro (públicas)
│   ├── (protected)/         # Páginas que requieren sesión
│   │   ├── page.tsx         # Panel Principal
│   │   ├── materias-primas/
│   │   ├── costos/
│   │   └── inventario/
│   └── layout.tsx           # Layout raíz
├── components/              # UI compartida
├── lib/
│   ├── prisma.ts            # Cliente DB
│   ├── supabase/            # Clientes de Auth
│   ├── auth.ts              # Helpers de roles/permisos
│   ├── services.ts          # Queries (capa de datos)
│   ├── actions.ts           # Server Actions (mutaciones)
│   ├── reports.ts           # Generación de Excel/PDF
│   └── format.ts            # Formato moneda/fecha
├── types/index.ts           # Tipos del dominio
└── middleware.ts            # Protección de rutas
```

## 👥 Roles y permisos

| Acción | Admin | Empleado |
|---|---|---|
| Ver todo | ✅ | ✅ |
| Crear/editar insumos | ✅ | ❌ |
| Actualizar precios | ✅ | ❌ |
| Crear productos | ✅ | ❌ |
| Registrar movimientos | ✅ | ✅ |
| Transferir stock | ✅ | ✅ |
| Descargar reportes | ✅ | ✅ |

## 🛠️ Comandos

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run db:push          # Sincronizar schema con DB
npm run db:studio        # Interfaz visual de la DB
```

## 📦 Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM)
- **Supabase** (PostgreSQL + Auth)
- **Recharts** (gráficas)
- **ExcelJS** + **jsPDF** (reportes)

---

Proyecto Social PUJ · Pontificia Universidad Javeriana
