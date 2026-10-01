# Open Daycare

Aplicación de gestión de guardería (daycare) con soporte para personal administrativo y familias/padres.

## Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Backend**: Supabase (Database, Auth, Edge Functions, Storage)
- **Emails**: Resend

## Requisitos

- Node.js >= 18
- npm (o tu package manager preferido)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- Cuenta en [Supabase](https://supabase.com/dashboard)
- Cuenta en [Resend](https://resend.com/api-keys) (para envío de emails)

## Configuración del proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y completa las variables:

```bash
cp .env.template .env
```

Edita `.env` con tus valores:

| Variable                               | Descripción                                                 |
| -------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL de tu proyecto Supabase                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable (formato `sb_publishable_...`)             |
| `SUPABASE_SERVICE_ROLE_KEY`            | Clave de servicio (solo servidor, nunca exponer al cliente) |
| `SUPABASE_DB_PASSWORD`                 | Password de la base de datos                                |
| `RESEND_API_KEY`                       | API key de Resend para envío de emails                      |
| `NEXT_PUBLIC_APP_URL`                  | URL base de la app (default: `http://localhost:3000`)       |

### 3. Ejecutar migraciones

Las migraciones están en `supabase/migrations/`. Para aplicarlas al proyecto remoto:

```bash
supabase db push
```

## Levantar el proyecto

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de producción

```bash
npm run build
npm run start
```

### Linting y typecheck

```bash
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript
```

## Supabase CLI - Autenticación

### Login en tu máquina

Para autenticar el CLI de Supabase con tu cuenta:

```bash
supabase login
```

Esto abrirá el navegador para que autorices el acceso con tu cuenta de Supabase. Una vez completado, el CLI queda autenticado localmente.

### Vincular tu proyecto

Si el proyecto aún no está vinculado localmente:

```bash
supabase link --project-ref <tu-project-ref>
```

El `<project-ref>` lo encuentres en el dashboard de Supabase: **Settings > General > Project ID** (o en la URL: `https://supabase.com/dashboard/project/<project-ref>`).

### Verificar conexión

```bash
supabase status
```

## Supabase MCP - Autenticación

Después de hacer `supabase login`, debes validar que el MCP de Supabase esté autenticado en opencode:

```bash
opencode mcp auth supabase
```

Este comando verifica que el MCP pueda conectarse correctamente a tu proyecto Supabase. Si falla, asegúrate de:

1. Haber hecho `supabase login` exitosamente
2. El proyecto esté linkeado con `supabase link --project-ref <tu-project-ref>`
3. Las variables de entorno en `.env` coincidan con tu proyecto

## Estructura del proyecto

```
├── app/                    # Next.js App Router
├── components/             # Componentes reutilizables
├── supabase/migrations/    # Migraciones de base de datos
├── utils/supabase/         # Clientes de Supabase (server, client, middleware, admin)
├── references/pantallas/   # Diseños de referencia (.dc.html)
├── references/screenshots/ # Capturas de pantalla de referencia
└── .env.template           # Plantilla de variables de entorno
```

## Notas importantes

- **Migraciones**: Toda modificación DDL/DML debe aplicarse via migración, nunca con SQL directo en producción.
- **RLS**: Todas las tablas expuestas tienen Row Level Security habilitado.
- **Service Role Key**: Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en código cliente.
