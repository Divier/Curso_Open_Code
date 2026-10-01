# SPEC 06 — Modal de nueva publicación (calco de crear-publicacion.dc.html como dialog)

> **Estado:** aprobado
> **Depende de:** SPEC 01 (home-feed) — reutiliza tipos `FeedPost`, `POST_TYPE_LABEL`, tokens CSS y el sidebar de `app/page.tsx`; SPEC 02 (kids-list-and-profile) — reutiliza data de niños de `app/_data/kids.ts`
> **Fecha:** 2026-07-07
> **Objetivo:** Implementar un modal dialog overlay que replica `crear-publicacion.dc.html`, disparado desde el botón "Nueva publicación" del sidebar, con validación de destinatario, tipo y descripción obligatorios, y cierre al publicar (visual, sin persistencia).

## Scope

**In:**

- Componente `NewPostModal` en `components/home/NewPostModal.tsx` que replica `references/pantallas/crear-publicacion.dc.html` como un dialog/modal overlay:
  - Backdrop oscuro semitransparente que cierra el modal al hacer click fuera.
  - Tecla `Esc` cierra el modal.
  - Header del modal: link `Cancelar` (izquierda), título `Nueva publicación` (centro, Fredoka), link `Publicar` (derecha, color accent).
  - Sección **PARA**: botones toggle por cada niño del mock de `kids.ts` + botón "Toda la sala". Solo uno seleccionado a la vez. Estilo pill con avatar de inicial para niños.
  - Sección **TIPO**: 7 botones toggle (`meal`, `nap`, `activity`, `achievement`, `mood`, `photo`, `announcement`). Labels en español vía `NEW_POST_TYPE_LABEL`. Solo uno seleccionado. Colores fijos del HTML.
  - Sección **DESCRIPCIÓN**: textarea con placeholder "Contá cómo le fue hoy…", mínimo 120px de alto, redimensionable vertical.
  - Sección **FOTOS**: placeholder de foto existente (96x96, borde sólido) + botón "Agregar" (96x96, borde dashed, ícono +). Solo visual.
  - Click en `Publicar` valida: destinatario seleccionado, tipo seleccionado, descripción no vacía. Si todo válido, cierra el modal. Si falta algo, no cierra (sin mensaje visual de error por ahora, solo no cierra).
- Integración en `components/shared/Sidebar.tsx`: el botón "Nueva publicación" deja de ser `<a href="#">` y se convierte en `<button>` que abre el modal.
- Integración en `app/page.tsx`: estado `showNewPost` y render del `<NewPostModal>`.
- Reutilización de tokens CSS existentes (`@theme`) y paleta del proyecto. Agregar nuevos tokens si hacen falta.

**Out of scope (para specs futuras):**

- Agregar el post al feed o al mock de `posts`.
- Persistencia real de la publicación (se pierde al recargar).
- Subida real de fotos: el botón "Agregar" y el placeholder son solo visuales.
- Backend, base de datos, API.
- Las demás pantallas del catálogo.

## Data model

Reutiliza los modelos existentes. No introduce nuevas estructuras de datos permanentes.

```ts
// Tipos de publicación del modal (nuevos, más granulares que PostType existente):
type NewPostType =
  | 'meal'
  | 'nap'
  | 'activity'
  | 'achievement'
  | 'mood'
  | 'photo'
  | 'announcement';

// Etiquetas visuales (español) por tipo:
const NEW_POST_TYPE_LABEL: Record<NewPostType, string> = {
  meal: 'Comida',
  nap: 'Siesta',
  activity: 'Actividad',
  achievement: 'Logro',
  mood: 'Ánimo',
  photo: 'Foto',
  announcement: 'Anuncio',
};

// Colores por tipo (del HTML):
const NEW_POST_TYPE_COLORS: Record<NewPostType, { bg: string; text: string }> =
  {
    meal: { bg: '#9A7B1E', text: '#fff' },
    nap: { bg: '#E7DCF6', text: '#7B5FC0' },
    activity: { bg: '#2E89A6', text: '#fff' },
    achievement: { bg: '#CFEBD8', text: '#3E9B6C' },
    mood: { bg: '#F9D2DE', text: '#C56486' },
    photo: { bg: '#FBD8CC', text: '#D9684A' },
    announcement: { bg: '#CCD8F4', text: '#4E72C8' },
  };

// Destinatario seleccionado:
type NewPostTarget =
  | {
      type: 'kid';
      id: string;
      name: string;
      initial: string;
      avatarBg: string;
      avatarColor: string;
    }
  | { type: 'all'; label: string }; // "Toda la sala"
```

Los niños se obtienen del mock existente en `app/_data/kids.ts` (función `getKids()` o equivalente).

## Implementation plan

1. **Tipos y constantes del modal.** Agregar a `app/_data/mock.ts` (o archivo nuevo `app/_data/newPost.ts`):
   - Tipo `NewPostType` (valores en inglés: `meal`, `nap`, `activity`, `achievement`, `mood`, `photo`, `announcement`), `NEW_POST_TYPE_LABEL` (labels en español), `NEW_POST_TYPE_COLORS`.
   - Función helper `getNewPostTargets()` que devuelve la lista de destinatarios desde `kids.ts` + opción "Toda la sala".
   - _Prueba: importar y verificar que los targets incluyen los niños del mock._

2. **Componente `NewPostModal`.** Crear `components/home/NewPostModal.tsx`:
   - Props: `{ open: boolean; onClose: () => void; onPublish: () => void }`.
   - Usa `useEffect` para escuchar `Esc` y cerrar.
   - Backdrop con `fixed inset-0 bg-black/40` que cierra al click.
   - Panel centrado (max-width 580px, fondo `#FBF4EC`, bordes redondeados 24px, sombra).
   - Header: `Cancelar` (izq, color muted), `Nueva publicación` (centro, Fredoka), `Publicar` (der, accent).
   - Sección PARA: botones pill con avatares de inicial para niños + "Toda la sala". Toggle single-select.
   - Sección TIPO: 7 botones con colores del HTML. Toggle single-select.
   - Sección DESCRIPCIÓN: textarea con estado local.
   - Sección FOTOS: placeholder + botón "Agregar" (solo visual).
   - Click en `Publicar`: valida `target && type && description.trim()`. Si válido, llama `onPublish` y cierra. Si no, no cierra.
   - _Prueba: renderizar con `open={true}` en un wrapper temporal._

3. **Integrar en el sidebar.** Actualizar `components/shared/Sidebar.tsx`:
   - Cambiar `<a href="#">` de "Nueva publicación" a `<button>` con `onClick` que recibe `onOpenNewPost` como prop.
   - Props de `Sidebar`: `{ pathname: string; onOpenNewPost?: () => void }`.

4. **Integrar en `app/page.tsx`.** Actualizar `app/page.tsx`:
   - Agregar estado `showNewPost` (`useState`).
   - Pasar `onOpenNewPost={() => setShowNewPost(true)}` al `Sidebar`.
   - Renderizar `<NewPostModal open={showNewPost} onClose={() => setShowNewPost(false)} onPublish={() => setShowNewPost(false)} />`.
   - _Prueba: click en "Nueva publicación" → modal aparece; Cancelar/Esc/backdrop → modal cierra; Publicar con campos válidos → modal cierra._

5. **Tokens CSS nuevos.** Agregar a `@theme` en `app/globals.css` los colores de los tipos de publicación que no existan ya (comida `#9A7B1E`, siesta `#E7DCF6`/`#7B5FC0`, ánimo `#F9D2DE`/`#C56486`, foto `#FBD8CC`/`#D9684A`).

6. **Ensamblar y verificar.** `npm run dev`, comparar el modal abierto contra `references/pantallas/crear-publicacion.dc.html`. Ejecutar `npm run lint` y `npx tsc --noEmit`.

## Acceptance criteria

- [ ] El botón "Nueva publicación" en el sidebar es un `<button>` (no un `<a>`).
- [ ] Click en "Nueva publicación" abre un modal dialog overlay.
- [ ] El modal muestra un backdrop oscuro semitransparente detrás del formulario.
- [ ] Click en el backdrop cierra el modal.
- [ ] Presionar `Esc` cierra el modal.
- [ ] Click en `Cancelar` cierra el modal.
- [ ] El header del modal muestra `Cancelar` (izquierda), `Nueva publicación` (centro, Fredoka), `Publicar` (derecha, accent).
- [ ] La sección PARA muestra botones pill por cada niño del mock + "Toda la sala".
- [ ] Los botones de PARA funcionan como toggle (solo uno seleccionado a la vez).
- [ ] Los niños en PARA muestran avatar con inicial, nombre y colores del mock.
- [ ] La sección TIPO muestra 7 botones con labels en español: Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio (valores internos en inglés).
- [ ] Los botones de TIPO funcionan como toggle (solo uno seleccionado a la vez).
- [ ] Cada botón de TIPO tiene el color de fondo y texto del HTML de referencia.
- [ ] La sección DESCRIPCIÓN muestra un textarea con placeholder "Contá cómo le fue hoy…".
- [ ] La sección FOTOS muestra un placeholder de foto + botón "Agregar" con borde dashed.
- [ ] Click en `Publicar` sin seleccionar destinatario no cierra el modal.
- [ ] Click en `Publicar` sin seleccionar tipo no cierra el modal.
- [ ] Click en `Publicar` con descripción vacía no cierra el modal.
- [ ] Click en `Publicar` con todos los campos válidos cierra el modal.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] No hay errores en la consola del navegador al abrir y cerrar el modal.

## Decisions

- **Sí:** Modal dialog overlay con backdrop y cierre por Esc/click fuera/Cancelar. Mismo patrón que `AddKidModal` y `LinkParentModal`.
- **Sí:** Validación de 3 campos obligatorios (destinatario, tipo, descripción) al intentar publicar. El usuario lo pidió explícitamente.
- **Sí:** Sin mensaje visual de error — simplemente no cierra el modal si falta algo. Mantiene la UI limpia; se puede agregar feedback visual en spec futura si se desea.
- **Sí:** "Publicar" solo cierra el modal, no agrega al mock de `posts`. Es visual, sin persistencia.
- **Sí:** Lista de niños reutilizada del mock de `kids.ts`. Consistente con el resto del proyecto.
- **Sí:** 7 tipos de publicación fijos con valores en inglés (`meal`, `nap`, `activity`, `achievement`, `mood`, `photo`, `announcement`) y labels en español. Colores del HTML.
- **No:** Agregar el post al feed. Va en spec de funcionalidad del feed.
- **No:** Subida real de fotos. Va en spec de manejo de archivos/media.
- **No:** Persistencia real. Va en spec de backend/BD.

## What is **not** in this spec

- Agregar la publicación al feed o al mock de `posts`.
- Persistencia real de la publicación.
- Subida real de fotos.
- Backend, base de datos, API.
- Las demás pantallas del catálogo.

Cada uno de esos, si llega, va en su propia spec.
