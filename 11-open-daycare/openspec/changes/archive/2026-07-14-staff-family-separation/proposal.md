## Why

Actualmente la aplicación tiene un solo feed y un mismo layout para todos los roles (staff, admin, parent). El diseño de referencia define 15 pantallas separadas en dos grupos claros: guardería/staff (10 pantallas) y familia/padre (5 pantallas), con navegación, funcionalidades y propósitos distintos. Sin esta separación, los padres pueden acceder a rutas de gestión (como `/kids`) que no les corresponden, y el layout no diferencia las experiencias de cada rol.

## What Changes

- **Rutas separadas**: `/staff/*` para personal y `/family/*` para familias
- **Proxy con validación de rol**: El proxy lee `users.role` y redirige según el rol — staff/admin a `/staff`, parent a `/family`
- **Root redirect**: `/` redirige automáticamente a `/staff` o `/family` según el rol del usuario autenticado
- **Sidebars separados**: `StaffSidebar` (Feed, Niños, Avisos, Mi cuenta) y `FamilySidebar` (Feed, Resumen del día, Mi cuenta)
- **Migración de rutas existentes**: `/kids` → `/staff/kids`, `/` → `/staff` o `/family`
- **Feed de familia filtrado**: La familia ve solo posts de sus hijos asignados vía `parent_children`
- **Protección hermética**: Un parent que intente acceder a `/staff/*` es redirigido silenciosamente a `/family` y viceversa
- **Sin error 403**: Las redirecciones son automáticas, el usuario nunca ve un error de acceso denegado

## Capabilities

### New Capabilities
- `role-based-routing`: Enrutamiento por rol con proxy que valida `users.role` y redirige entre `/staff/*` y `/family/*`
- `staff-navigation`: Layout, sidebar y navegación específica para staff (Feed, Niños, Avisos, Mi cuenta)
- `family-navigation`: Layout, sidebar y navegación específica para familia (Feed, Resumen del día, Mi cuenta)
- `family-feed`: Feed filtrado que muestra solo publicaciones relacionadas con los hijos del padre logueado

### Modified Capabilities
- *(none — no existing specs to modify)*

## Impact

- **`proxy.ts`**: Agrega lógica de lectura de rol desde `users` table y redirección por prefijo de ruta
- **`app/`**: Reestructuración de rutas — `app/page.tsx` se elimina, se crean `app/staff/` y `app/family/`
- **`app/kids/`**: Se mueve a `app/staff/kids/`
- **`components/shared/Sidebar.tsx`**: Se reemplaza por `components/staff/StaffSidebar.tsx` y `components/family/FamilySidebar.tsx`
- **`components/shared/MobileNav.tsx`**: Se reemplaza por `components/staff/StaffMobileNav.tsx` y `components/family/FamilyMobileNav.tsx`
- **`app/_queries/posts.ts`**: Se agrega `getFamilyPosts(userId)` para feed filtrado
- **`app/_actions/children.ts`**: Se actualiza `revalidatePath('/kids')` → `revalidatePath('/staff/kids')`
