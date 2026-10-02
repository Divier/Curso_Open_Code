# SPEC 12 — Crear publicaciones reales con imágenes (staff only)

> **Estado:** approved
> **Depende de:** SPEC 01 (home-feed), SPEC 06 (new-post-modal), SPEC 09 (real-auth), SPEC 08 (users table)
> **Fecha:** 2026-07-13
> **Objetivo:** Permitir que miembros del staff creen publicaciones reales que se guarden en Supabase, con subida opcional de imágenes a Storage, y que aparezcan inmediatamente al inicio del feed.

## Scope

**In:**

- Tabla `posts` en Supabase con tipos de publicación, destinatario, descripción, autor y timestamps.
- Tabla `post_images` en Supabase para almacenar referencias a imágenes subidas.
- Bucket de Storage `post-images` con políticas de acceso.
- RLS policies: staff crea/ve todos los posts de su daycare; padres ven posts dirigidos a sus hijos + posts "toda la sala".
- Modificación del `NewPostModal` para:
  - Subir imágenes reales a Supabase Storage (file picker, máximo 10 imágenes, hasta 3 MB cada una, formatos web válidos: jpg, jpeg, png, webp, gif).
  - Preview de imágenes seleccionadas antes de publicar.
  - Eliminar imágenes seleccionadas antes de publicar.
  - Validar máximo 10 imágenes; si se excede, no permite agregar más.
  - Al "Publicar": crear el post en la BD + subir imágenes + revalidar el feed.
  - Si falla la subida de alguna imagen: rollback completo (no se crea el post, se limpian imágenes subidas).
  - Mostrar indicador de carga mientras se publica; el modal permanece abierto hasta confirmar éxito o error.
- El modal y botón "Nueva publicación" solo se muestran para usuarios con `role = 'staff'` o `role = 'admin'`. Para parents, el botón no se renderiza.
- Feed (`app/page.tsx`) lee posts reales de Supabase en lugar del mock.
- Posts nuevos aparecen al inicio del feed inmediatamente después de publicar (revalidación, no optimista).
- Soporte para posts sin imágenes (descripción sola).
- Carrusel de imágenes en `PostCard`: múltiples imágenes se muestran en un carrusel con swipe en móvil (CSS scroll-snap o touch events).
- Tiempo relativo en los posts ("hace 5 min", "hace 2 h", "ayer").
- Selector de niños en el modal trae los niños reales de Supabase (`children` table), no del mock.

**Out of scope (para specs futuras):**

- Editar publicaciones existentes.
- Eliminar publicaciones.
- Likes y comentarios (solo visual en el feed actual).
- Notificaciones push/email.
- Publicaciones desde familias/parents.
- Galería de fotos separada.

## Data model

### Tabla `posts`

| Columna           | Tipo                          | Descripción                                                   |
| ----------------- | ----------------------------- | ------------------------------------------------------------- |
| `id`              | uuid PK                       | `gen_random_uuid()`                                           |
| `daycare_id`      | uuid FK → daycares            | Guardería del post                                            |
| `author_id`       | uuid FK → users               | Staff que publicó                                             |
| `post_type`       | enum `post_type`              | `meal, nap, activity, achievement, mood, photo, announcement` |
| `description`     | text                          | Cuerpo del post (obligatorio, no vacío)                       |
| `target_type`     | enum `post_target`            | `kid` o `all`                                                 |
| `target_child_id` | uuid FK → children (nullable) | ID del niño si `target_type = 'kid'`                          |
| `created_at`      | timestamptz                   | `now()`                                                       |
| `updated_at`      | timestamptz                   | `now()`                                                       |

### Enum `post_type`

```sql
CREATE TYPE post_type AS ENUM (
  'meal',
  'nap',
  'activity',
  'achievement',
  'mood',
  'photo',
  'announcement'
);
```

### Enum `post_target`

```sql
CREATE TYPE post_target AS ENUM ('kid', 'all');
```

### Tabla `post_images`

| Columna        | Tipo                             | Descripción                               |
| -------------- | -------------------------------- | ----------------------------------------- |
| `id`           | uuid PK                          | `gen_random_uuid()`                       |
| `post_id`      | uuid FK → posts (cascade delete) | Post al que pertenece                     |
| `storage_path` | text                             | Path relativo en el bucket `post-images`  |
| `caption`      | text (nullable)                  | Descripción opcional de la imagen         |
| `sort_order`   | int                              | Orden de la imagen en el post (default 0) |
| `created_at`   | timestamptz                      | `now()`                                   |

### Storage bucket `post-images`

- `public = false` (acceso controlado por RLS).
- Escritura solo para usuarios con `role = 'staff'` o `role = 'admin'`.
- Lectura para cualquier usuario autenticado.
- Path: `{daycare_id}/{post_id}/{uuid}.{ext}`
- Formatos aceptados: jpg, jpeg, png, webp, gif.
- Tamaño máximo: 3 MB por archivo.

### Validación de imágenes

- Máximo 10 imágenes por post.
- Validación en cliente: tipo MIME (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) y tamaño (≤ 3 MB).
- Validación en server action: mismo check antes de subir.
- Si una imagen falla la validación: se rechaza y no se sube, pero el resto del flujo continúa (a menos que el usuario intente publicar con esa imagen inválida).

### RLS policies

**Tabla `posts`:**

| Política                   | Rol          | Condición                                                                                          |
| -------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `staff_select_own_daycare` | staff, admin | `daycare_id = user's daycare_id`                                                                   |
| `parent_select_targeted`   | parent       | `target_type = 'all' AND daycare_id = user's daycare_id` OR `target_child_id IN (user's children)` |
| `staff_insert`             | staff, admin | `author_id = auth.uid() AND daycare_id = user's daycare_id`                                        |
| `staff_update_own`         | staff, admin | `author_id = auth.uid()`                                                                           |
| `staff_delete_own`         | staff, admin | `author_id = auth.uid()`                                                                           |

**Tabla `post_images`:**

| Política                 | Rol          | Condición                                                                                            |
| ------------------------ | ------------ | ---------------------------------------------------------------------------------------------------- |
| `select_via_post_access` | todos        | `EXISTS (SELECT 1 FROM posts WHERE posts.id = post_images.post_id AND <RLS del usuario aplica>)`     |
| `staff_insert`           | staff, admin | `EXISTS (SELECT 1 FROM posts WHERE posts.id = post_images.post_id AND posts.author_id = auth.uid())` |
| `staff_delete_own`       | staff, admin | `EXISTS (SELECT 1 FROM posts WHERE posts.id = post_images.post_id AND posts.author_id = auth.uid())` |

**Storage `post-images`:**

| Política               | Rol                | Condición                                                                                       |
| ---------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `select_authenticated` | todos autenticados | `auth.role() = 'authenticated'`                                                                 |
| `insert_staff`         | staff, admin       | `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('staff', 'admin'))` |
| `delete_staff`         | staff, admin       | `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('staff', 'admin'))` |

## Implementation plan

### Paso 1: Migración de base de datos

Crear migración con:

1. Enums `post_type` y `post_target`.
2. Tabla `posts` con FKs a `daycares`, `users`, `children`.
3. Tabla `post_images` con FK a `posts` (cascade delete).
4. RLS policies para `posts` y `post_images`.
5. Índices: `posts(daycare_id, created_at DESC)`, `posts(target_child_id)`, `post_images(post_id, sort_order)`.
6. Trigger `updated_at` para `posts` y `post_images`.

### Paso 2: Bucket de Storage

Crear bucket `post-images` vía Supabase MCP o CLI:

- `public = false` (acceso controlado por RLS).
- Políticas de storage para lectura (authenticated) y escritura (staff/admin).

### Paso 3: Tipos TypeScript y helpers

Crear `app/_data/posts.ts`:

- Tipos `Post`, `PostImage`, `PostType`, `PostTarget` mapeados a la DB.
- Función `getPostTypeConfig(type)` que devuelve badge colors, labels en español, etc. (unificar con `NEW_POST_TYPE_COLORS` existente).
- Helper `buildPostImageUrl(storagePath)` para construir URLs de imágenes desde Storage.
- Constantes: `MAX_IMAGES = 10`, `MAX_IMAGE_SIZE = 3 * 1024 * 1024` (3 MB), `ALLOWED_IMAGE_TYPES`.
- Función `validateImage(file)` que retorna `{ valid: boolean, error?: string }`.
- Función `formatRelativeTime(date)` para tiempo relativo en español ("hace 5 min", "hace 2 h", "ayer", etc.).

### Paso 4: Server action para crear posts

Crear `app/_actions/createPost.ts`:

- Server action que recibe: `postType`, `description`, `targetType`, `targetChildId?`, `images: File[]?`.
- Obtiene el usuario autenticado desde la sesión (server component context).
- Valida: usuario es staff/admin, description no vacío, targetType válido.
- Valida imágenes: máximo 10, tipo y tamaño correctos.
- Inserta el post en la tabla `posts` dentro de una transacción.
- Si hay imágenes:
  - Sube cada imagen a Storage con path `{daycare_id}/{post_id}/{uuid}.{ext}`.
  - Inserta registros en `post_images`.
- **Rollback:** Si cualquier operación falla (insert post, upload, insert image), se hace rollback:
  - Si el post ya se insertó pero falla alguna imagen, se borra el post y las imágenes ya subidas.
  - Retorna `{ success: false, error }` para que el modal lo muestre.
- Retorna `{ success: true, postId }` o `{ success: false, error }`.

### Paso 5: Modificar `NewPostModal` para usar la server action

Actualizar `components/home/NewPostModal.tsx`:

- Agregar estado para imágenes seleccionadas: `File[]` + preview URLs (`URL.createObjectURL`).
- Agregar input `file` oculto (`accept="image/jpeg,image/png,image/webp,image/gif"`, `multiple`) + botón "Agregar" que lo dispara.
- Validar al seleccionar: si ya hay 10 imágenes, no permite agregar más. Si una imagen excede 3 MB o tipo inválido, mostrar error y no agregarla.
- Mostrar previews de imágenes seleccionadas (grid de thumbnails) con botón de eliminar (X) en cada una.
- Agregar estado `isSubmitting` para indicar carga.
- Al "Publicar":
  - Si `isSubmitting`, no hacer nada (evitar doble submit).
  - Setear `isSubmitting = true`.
  - Llamar a la server action con los datos + archivos.
  - Si éxito: llamar `onPublish` (que revalidará el feed) y cerrar modal.
  - Si error: mostrar mensaje de error en el modal, mantenerlo abierto, limpiar `isSubmitting`.
- Limpiar URLs de preview en el cleanup (`URL.revokeObjectURL`).
- El modal solo se renderiza si el usuario es staff/admin (verificar desde props o contexto).
- Selector de niños: llamar a Supabase desde el modal (o recibir como prop desde server component) para obtener `children` reales del daycare del usuario.

### Paso 6: Leer posts reales desde Supabase

Crear `app/_queries/posts.ts`:

- Función `getPosts(supabaseClient)` que hace query a `posts` + `post_images` + `author` (users) + `target_child` (children).
- Join: `posts` → `users` (author: `full_name`, `avatar_url`), `posts` → `children` (target: `full_name`), `posts` → `post_images` (array de imágenes ordenadas por `sort_order`).
- Orden: `created_at DESC`.
- RLS se aplica automáticamente según el rol del usuario.
- Mapea los resultados a un formato compatible con `PostCard`:
  - `authorName`, `authorInitial`, `avatarBg`, `avatarColor` desde `users`.
  - `audience` desde `target_child.full_name` o "toda la sala".
  - `images` array de URLs construidas con `buildPostImageUrl`.
  - `relativeTime` calculado con `formatRelativeTime(created_at)`.
  - `postType` mapeado a los 7 tipos del enum.

Actualizar `app/page.tsx`:

- Server component que llama `getPosts()` y pasa los posts al client como prop.
- Revalidar el feed después de publicar (usar `revalidatePath` desde la server action o `router.refresh()` desde el client).
- Si no hay posts, mostrar mensaje vacío ("Aún no hay publicaciones").

### Paso 7: Actualizar `PostCard` para mostrar imágenes reales y tiempo relativo

Actualizar `components/home/PostCard.tsx`:

- Si el post tiene imágenes reales (`images.length > 0`):
  - Mostrar carrusel de imágenes con CSS scroll-snap.
  - Contenedor: `overflow-x-auto`, `snap-x`, `snap-mandatory`, `flex`, `gap-2`.
  - Cada imagen: `snap-center`, `min-w-full` (una imagen visible a la vez, swipe en móvil).
  - Indicadores de posición (dots) opcionales.
  - Si hay una sola imagen, mostrar sin scroll (full width).
- Si no tiene imágenes, no mostrar placeholder (solo el texto).
- Tiempo: reemplazar `time` fijo por `relativeTime` ("hace 5 min", "hace 2 h", "ayer").
- Las imágenes reales usan `<img>` con `src` desde Storage, `alt` con caption o descripción genérica.
- Mantener compatibilidad con el formato del mock para la transición.

### Paso 8: Integración y verificación

- `npm run dev` → crear un post con imágenes → verificar que aparece al inicio del feed.
- Crear un post sin imágenes → verificar que aparece correctamente.
- `npm run lint` y `npx tsc --noEmit`.
- Verificar RLS: loguearse como parent → solo ver posts dirigidos a sus hijos + "toda la sala".

## Acceptance criteria

- [ ] Tabla `posts` creada con enums, FKs, índices y RLS policies.
- [ ] Tabla `post_images` creada con FK cascade delete y RLS policies.
- [ ] Bucket `post-images` creado con políticas de acceso (lectura authenticated, escritura staff/admin).
- [ ] El botón "Nueva publicación" solo se muestra para usuarios con rol `staff` o `admin`. Para `parent`, no se renderiza.
- [ ] El selector de niños en el modal muestra niños reales de Supabase, no del mock.
- [ ] Staff puede crear una publicación con descripción, tipo y destinatario.
- [ ] Staff puede adjuntar 0 a 10 imágenes a una publicación.
- [ ] Validación de imágenes: máximo 10, formatos jpg/png/webp/gif, máximo 3 MB.
- [ ] Staff puede previsualizar imágenes seleccionadas antes de publicar (thumbnails con botón de eliminar).
- [ ] Staff puede eliminar imágenes seleccionadas antes de publicar.
- [ ] Si se intenta agregar más de 10 imágenes, se rechaza y no se agregan.
- [ ] Si una imagen excede 3 MB o tiene formato inválido, se rechaza con mensaje de error.
- [ ] Al publicar, el modal muestra indicador de carga y permanece abierto hasta confirmar.
- [ ] Si la publicación es exitosa: el post se guarda, las imágenes se suben, el modal se cierra, el feed se revalida.
- [ ] Si la publicación falla (incluyendo error de subida): rollback completo, no se crea nada, el modal muestra error y permanece abierto.
- [ ] El post nuevo aparece al inicio del feed después de revalidar.
- [ ] El feed muestra posts reales de Supabase, no el mock.
- [ ] `PostCard` muestra carrusel de imágenes cuando el post tiene imágenes (CSS scroll-snap, swipe en móvil).
- [ ] Posts sin imágenes se renderizan correctamente (solo texto, sin placeholder).
- [ ] El tiempo en los posts se muestra como relativo ("hace 5 min", "hace 2 h", "ayer").
- [ ] Parents solo ven posts dirigidos a sus hijos + posts "toda la sala".
- [ ] Staff ve todos los posts de su daycare.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] No hay errores en la consola del navegador al crear y ver posts.

## Decisions

- **Sí:** Server action para crear posts + subir imágenes. Patrón recomendado por Next.js + Supabase.
- **Sí:** Máximo 10 imágenes por post, hasta 3 MB cada una, formatos jpg/png/webp/gif.
- **Sí:** Preview de imágenes antes de publicar con `URL.createObjectURL`.
- **Sí:** Tabla separada `post_images` en lugar de JSON array. Mejor para RLS, queries y escalabilidad.
- **Sí:** Storage path con estructura `{daycare_id}/{post_id}/{uuid}.{ext}` para organización y limpieza.
- **Sí:** Feed lee de Supabase directamente, reemplazando el mock.
- **Sí:** Carrusel con CSS scroll-snap (`snap-x snap-mandatory`, `snap-center`) para swipe nativo en móvil sin dependencias externas.
- **Sí:** Tiempo relativo en español ("hace 5 min", "hace 2 h", "ayer") calculado en el cliente.
- **Sí:** Selector de niños desde Supabase (`children` table), no del mock.
- **Sí:** Rollback completo si falla cualquier parte del proceso (post, imágenes, storage). No se crea nada si algo falla.
- **Sí:** Modal permanece abierto durante la publicación con indicador de carga. Se cierra solo al confirmar éxito.
- **Sí:** Botón "Nueva publicación" solo visible para staff/admin. Para parents, no se renderiza.
- **No:** Actualización optimista del feed. Se revalida después de confirmar.
- **No:** Editar/eliminar posts en esta spec. Va en spec futura.
- **No:** Likes/comentarios funcionales. Solo visual por ahora.
- **No:** Notificaciones. Va en spec futura.

## What is **not** in this spec

- Editar publicaciones existentes.
- Eliminar publicaciones.
- Likes y comentarios funcionales.
- Notificaciones push/email.
- Publicaciones desde familias/parents.
- Galería de fotos separada.
- Paginación o infinite scroll del feed.
- Actualización optimista del feed.

Cada uno de esos, si llega, va en su propia spec.
