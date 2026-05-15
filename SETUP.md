# 🚀 Guía de configuración

## 1. Variables de entorno (`.env`)

Crea un archivo `.env` en la raíz con estas variables:

```env
# Conexión Prisma (Session pooler, puerto 5432)
DATABASE_URL="postgresql://postgres.TU_REF:TU_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.TU_REF:TU_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://TU_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
```

**Dónde obtener cada cosa:**

- **`DATABASE_URL` / `DIRECT_URL`**: Supabase → Project Settings → Database → Connection string → Session pooler
- **`NEXT_PUBLIC_SUPABASE_URL`**: Supabase → Project Settings → API → "Project URL"
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Supabase → Project Settings → API → "Project API keys" → `anon` `public`

## 2. Configurar Auth en Supabase

1. Ve a Supabase → **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado.
3. (Opcional para desarrollo) En **Authentication → Providers → Email** desactiva *"Confirm email"* para que no tengas que confirmar emails al registrarte. En producción, vuélvelo a activar.

## 3. Crear las tablas

```bash
npm install
npx prisma db push
```

Esto crea todas las tablas (incluyendo `usuario`).

## 4. Crear el primer Admin (Melanie)

Como por defecto los usuarios nuevos son **empleado**, hay que promover manualmente al primer admin:

### Opción A: Desde la app (más fácil)

1. Arranca la app: `npm run dev`
2. Ve a `http://localhost:3000/registro`
3. Crea la cuenta de Melanie (ej. `melanie@natulove.com`)
4. Inicia sesión
5. Ve a Supabase → **Table Editor** → tabla `usuario`
6. Encuentra la fila de Melanie y cambia el campo `rol` de `"empleado"` a `"admin"`
7. **Cierra sesión y vuelve a entrar** (importante para que se actualice)

### Opción B: Con SQL

En Supabase → SQL Editor:

```sql
UPDATE usuario SET rol = 'admin' WHERE email = 'melanie@natulove.com';
```

## 5. Arrancar la app

```bash
npm run dev
```

Abre `http://localhost:3000`. Te redirige al login.

## 🔧 Solución de problemas comunes

### "Can't reach database server"
Asegúrate de usar **puerto 5432** (Session pooler), no 6543. Tu red probablemente bloquea el 6543.

### "Email not confirmed"
Desactiva "Confirm email" en Supabase → Authentication → Providers → Email (solo desarrollo).

### El usuario quedó como empleado y no puede hacer nada
Sigue el paso 4 para promoverlo a admin. **Importante:** después de cambiar el rol en la DB, cierra sesión y vuelve a entrar.

### Error en `npx prisma db push`
Si te dice que faltan migraciones, prueba:
```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

(El `--accept-data-loss` solo en la primera vez, cuando aún no hay datos importantes.)

## 📋 Checklist post-setup

- [ ] Tabla `usuario` existe en Supabase
- [ ] Melanie tiene rol = `admin`
- [ ] Puede iniciar sesión
- [ ] Aparece "Administradora" debajo de su nombre en el sidebar
- [ ] Ve los botones "Nuevo Insumo", "Nuevo Producto", etc.
- [ ] La barra de búsqueda funciona (escribe 2+ letras)
- [ ] La campana muestra alertas si hay stock crítico
- [ ] El botón "Descargar Reporte" genera un Excel/PDF
