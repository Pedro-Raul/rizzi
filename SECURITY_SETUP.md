# Configuracion de seguridad

## Variables de entorno

Usa `.env.local` para desarrollo local y configura las mismas variables en el proveedor de despliegue.

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_llave_anon_publica
VITE_ALLOWED_ORIGIN=http://localhost:5173
```

No subas `.env.local` al repositorio. Ya esta ignorado por `.gitignore`.

La llave `anon` de Supabase es publica para clientes web, pero la llave `service_role` es sensible y nunca debe estar en Vite, React, archivos del repo ni variables `VITE_*`.

## Row Level Security

Ejecuta los SQL de tablas primero, por ejemplo:

1. `database_schema.sql`
2. SQL incrementales que uses, como `add_orders_system.sql`, `add_reviews_system.sql`, `storage_policies.sql`
3. `security_hardening.sql`

`security_hardening.sql` activa y fuerza RLS en las tablas de la app que existan:

- `users`
- `categories`
- `businesses`
- `products`
- `business_reports`
- `favorites`
- `reviews`
- `orders`
- `order_items`

Las policies existentes siguen decidiendo que puede leer o modificar cada usuario.

## CORS

Esta app no tiene un backend Express/Node propio; se conecta directamente a Supabase.

Configura los origenes permitidos del backend en Supabase con los dominios reales de la app:

- `http://localhost:5173`
- Dominio de produccion, por ejemplo `https://tu-dominio.vercel.app`

En Vite se configuro CORS para desarrollo local con `VITE_ALLOWED_ORIGIN`.

En `vercel.json` se agregaron headers para el despliegue estatico. Ajusta `Access-Control-Allow-Origin` al dominio real de produccion antes de publicar si no usas `https://rizzi.vercel.app`.
