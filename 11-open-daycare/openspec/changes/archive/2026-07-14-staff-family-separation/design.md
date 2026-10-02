## Context

La aplicación open-daycare es un sistema de gestión de guardería con tres roles: `staff`, `admin`, y `parent`. Actualmente todas las rutas comparten un mismo layout y feed (`app/page.tsx`), con diferenciación mínima basada en `userRole` pasado como prop. El diseño de referencia define 15 pantallas en dos grupos separados: 10 para staff y 5 para familia, con navegación y propósitos distintos.

El proyecto usa Next.js 16.2.10 con App Router, Supabase para auth y base de datos, y `proxy.ts` (en lugar de middleware) para protección de rutas.

## Goals / Non-Goals

**Goals:**
- Separar rutas en `/staff/*` y `/family/*` con layouts y navegación independientes
- Proteger el acceso: staff nunca ve panel familia, familia nunca ve panel staff
- Redirección automática y silenciosa — sin errores 403
- Migrar rutas existentes (`/kids` → `/staff/kids`, `/` → redirect por rol)
- Feed de familia filtrado por hijos asignados vía `parent_children`

**Non-Goals:**
- No cambiar colores o estilos de los layouts (se mantienen iguales por ahora)
- No implementar pantallas nuevas de familia (detalle de post, foto fullscreen, resumen del día) — solo placeholders
- No modificar la tabla `users` ni el esquema de roles
- No agregar cache de rol en JWT — se lee siempre de `users.role`

## Decisions

### 1. Carpetas explícitas vs route groups

**Decisión**: Carpetas explícitas `app/staff/` y `app/family/` (no route groups con paréntesis).

**Razón**: Los route groups `(staff)` no aparecen en la URL. Necesitamos URLs explícitas (`/staff`, `/family`) para que el proxy pueda hacer matching por prefijo y redirigir según rol.

**Alternativas consideradas**:
- Route groups `(staff)/page.tsx` → URL sería `/`, no permite matching por prefijo
- Mixed approach con route groups internos → posible para sub-componentes pero la separación principal debe ser explícita

### 2. Lectura de rol en el proxy

**Decisión**: Query directa a `users.role` en cada request del proxy.

**Razón**: Simpleza y consistencia. El rol puede cambiar y la query es barata (index por `id`). No necesitamos cache en JWT por ahora.

**Alternativas consideradas**:
- Guardar rol en `raw_app_meta_data` del JWT → más rápido pero requiere sync cuando cambia el rol
- Cookie separada con rol → complejidad adicional, posible inconsistencia

### 3. Sidebars separados vs genérico con props

**Decisión**: Dos sidebars completamente separados (`StaffSidebar`, `FamilySidebar`).

**Razón**: Los items de navegación, botones de acción (crear post vs sin crear), y la estructura son suficientemente distintos que un componente genérico con props sería más complejo que dos componentes simples.

### 4. Layouts con mismo estilo visual

**Decisión**: Los layouts de staff y familia comparten la misma estructura visual (sidebar izquierda, contenido derecha, mobile nav). Solo cambian los items de navegación y el contenido.

**Razón**: El usuario confirmó que los layouts pueden ser iguales, no hace falta cambiar colores. La diferenciación visual vendrá después si se decide.

### 5. Feed de familia filtrado

**Decisión**: Nueva función `getFamilyPosts(userId)` que:
1. Obtiene los hijos del padre vía `parent_children`
2. Obtiene el `daycare_id` y `room_id` de esos hijos
3. Filtra posts donde `target_child_id IN (childIds)` o `target_type = 'room'` para anuncios generales

**Razón**: La familia solo debe ver publicaciones de sus hijos y anuncios generales de la sala, no todos los posts de la guardería.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Query de rol en cada request agrega latencia | Es una query simple con índice por `id`. Si se vuelve problema, se puede agregar cache en JWT después |
| Redirección silenciosa puede confundir si el usuario bookmarked una ruta | El redirect es inmediato — el usuario siempre llega a su panel correcto |
| Duplicación de componentes (Sidebar, MobileNav) | Se pueden extraer utilidades compartidas después si hay drift visual |
| `app/page.tsx` eliminado — cualquier link externo a `/` se redirige | El proxy maneja el redirect automáticamente según rol |

## Migration Plan

1. Crear nuevos componentes de sidebar y mobile nav para staff y familia
2. Crear layouts y páginas de `app/staff/` y `app/family/`
3. Mover `app/kids/` → `app/staff/kids/`
4. Actualizar `proxy.ts` con lógica de rol
5. Eliminar `app/page.tsx` (el proxy redirige `/` según rol)
6. Actualizar `revalidatePath` en server actions
7. Eliminar componentes compartidos obsoletos (`Sidebar.tsx`, `MobileNav.tsx`)

**Rollback**: Revertir el commit que elimina `app/page.tsx` y restaurar `proxy.ts` anterior. Las nuevas carpetas no afectan la ruta raíz si se restaura el page.tsx.

## Open Questions

- ¿Las páginas placeholder de familia (day-summary, account) tendrán contenido real en este cambio o en un change separado? → **Decidido**: placeholders por ahora
- ¿El botón "Todos" en el filtro de hijos del feed familia requiere estado de UI? → **Decidido**: sí, se implementa como estado local en el componente
