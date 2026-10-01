# SPEC 01 — Home Feed estático (calco de feed.dc.html)

> **Estado:** Implementado
> **Depende de:** — (primera spec)
> **Fecha:** 2026-07-02
> **Objetivo:** Implementar el home (`/`) como calco visual del feed de la guardería (`references/pantallas/feed.dc.html`) con datos mock, sin autenticación ni base de datos, y sidebar responsive colapsable en mobile.

## Scope

**In:**

- Página home en `app/page.tsx` que reemplaza el scaffold de create-next-app y replica `references/pantallas/feed.dc.html`.
- Sidebar de desktop (248px, fija, sticky): logo `OpenDayCare · Sala Soles`, botón `Nueva publicación`, nav con 4 items (`Feed` activo, `Niños`, `Avisos`, `Mi cuenta`) y tarjeta de usuario (`Caro Giménez · Maestra · Soles`) con botón de logout.
- Main scrollable: eyebrow `GUARDERÍA · SALA SOLES`, h1 `Buenas, Caro`, subtítulo `12 niños · martes 17 jun`.
- Composer `Compartí un momento…` (caja con avatar `C` e ícono de cámara).
- Divisor `PUBLICADO HOY` con línea separadora.
- Lista de 3 posts con los textos, badges y audiencias del template:
  - Post **logro** (Mateo, badge `LOGRO` verde, `Para: familia de Mateo`).
  - Post **actividad** (Mateo, badge `ACTIVIDAD` azul, con placeholder de foto dashed).
  - Post **anuncio** (avatar con ícono megáfono, badge `ANUNCIO`, `Para: toda la sala`).
- Cada post con footer: contador de corazones, contador de comentarios y link `Editar`.
- Fuentes Fredoka (headings/avatares con iniciales) + Nunito (cuerpo) vía `next/font/google` en `app/layout.tsx`.
- Tokens de la paleta cálida en `@theme` de `app/globals.css` (bg `#F6ECDF`, accent `#D9583C`/`#F2937A`/`#EE8164`, staff blue `#2E89A6`, logro green `#3E9B6C`, anuncio blue `#4E72C8`).
- Responsive: en mobile el sidebar se oculta y un botón hamburguesa abre un drawer con el mismo contenido del sidebar.
- Componentes descompuestos en `components/shared/` (reutilizables) y `components/home/` (propios del home).
- Data mock en `app/_data/mock.ts`.
- `lang="es"` y `metadata` (`OpenDayCare`) actualizados en `app/layout.tsx`.
- Remover el dark mode heredado de `globals.css`.

**Out of scope (para specs futuras):**

- Autenticación, login, activación de cuenta y sesiones (pantallas 01 y 02 del catálogo).
- Base de datos o cualquier forma de persistencia.
- Funcionalidad de botones y links (`Nueva publicación`, nav, `Editar`, composer, logout, foto, comentarios): quedan como placeholders visuales sin navegación ni acción.
- Las otras 13 pantallas del catálogo (`crear-publicacion`, `ninos`, `perfil-nino`, `agregar-nino`, `vincular-padre`, `avisos`, `mi-cuenta`, `familia-feed`, `detalle-publicacion`, `foto`, `resumen-dia`, `familia-cuenta`).
- Reacciones y comentarios funcionales: los contadores son estáticos del mock.
- Subida real de fotos: el placeholder de foto queda como en el template.
- Filtros o buscador del feed.

## Data model

Datos mock en `app/_data/mock.ts`. No hay persistencia: todo es estático y en memoria.

```ts
export type PostType = 'achievement' | 'activity' | 'announcement';
export type NavIcon = 'home' | 'kids' | 'bell' | 'user';

// Etiquetas visuales (español) por tipo — el dato va en inglés, la UI en español.
export const POST_TYPE_LABEL: Record<PostType, string> = {
  achievement: 'LOGRO',
  activity: 'ACTIVIDAD',
  announcement: 'ANUNCIO',
};

export interface FeedPost {
  id: string;
  authorName: string; // "Mateo" | "Anuncio general"
  authorInitial?: string; // "M" (omitto si el avatar usa ícono)
  avatarBg: string; // "#A9D9E8" | "#CCD8F4"
  avatarColor: string; // "#1F7A93" | "#4E72C8"
  avatarIcon?: 'megaphone'; // presente en el post anuncio
  time: string; // "14:20"
  publishedByMe: boolean; // → "publicado por vos"
  type: PostType;
  audience: string; // "familia de Mateo" | "toda la sala"
  text: string;
  photoPlaceholder?: { label: string }; // "Foto · pintando con témperas"
  hearts: number;
  comments: number;
}

export interface NavItem {
  label: string; // "Feed" | "Niños" | "Avisos" | "Mi cuenta"
  icon: NavIcon;
  active: boolean;
}

export interface SidebarUser {
  name: string; // "Caro Giménez"
  role: string; // "Maestra · Soles"
  initial: string; // "C"
}
```

Convenciones:

- El color y la etiqueta del badge se derivan de `type` en el componente (en español para la UI, pero el dato es inglés): `achievement`→`LOGRO` verde `#3E9B6C`, `activity`→`ACTIVIDAD` azul `#2E89A6`, `announcement`→`ANUNCIO` `#4E72C8`; no va en el dato.
- Los `href` de nav y links quedan como `#` (placeholders no funcionales).
- Los SVG de íconos se centralizan en `components/shared/icons.tsx` (mismos `viewBox`/`stroke` del template).

## Implementation plan

1. **Base global.** En `app/layout.tsx` reemplazar Geist/Geist*Mono por `Fredoka` y `Nunito` (`next/font/google`) con variables `--font-fredoka` y `--font-nunito`; cambiar `lang` a `es`; actualizar `metadata` (title `OpenDayCare`). En `app/globals.css` ampliar `@theme` con los tokens de paleta y de fuente, definir fondo `#F6ECDF`/texto `#3F362E` y eliminar el bloque de dark mode. \_Prueba manual: `npm run dev`, fondo cálido y fuentes cargando.*
2. **Data mock.** Crear `app/_data/mock.ts` con los tipos de arriba y los datos: 3 posts, 4 `NavItem`, 1 `SidebarUser` y el subtítulo de sala. _Prueba: importar desde `page.tsx` sin romper._
3. **Iconos.** Crear `components/shared/icons.tsx` con los SVG del template como componentes nombrados (logo/sol, plus, home, kids, bell, user, logout, heart, comment, camera, megaphone).
4. **Sidebar (desktop).** Crear `components/shared/Sidebar.tsx`: logo, botón `Nueva publicación`, nav (Feed activo) y tarjeta de usuario con logout. Renderiza íconos de `shared/icons.tsx`. Visible solo en desktop (`md:flex` / oculto en mobile).
5. **MobileNav (drawer).** Crear `components/shared/MobileNav.tsx`: botón hamburguesa fijo (visible solo en `< md`) que abre un overlay drawer que reutiliza el contenido del `Sidebar`.
6. **Atómicos del home.** Crear en `components/home/`: `FeedHeader.tsx` (eyebrow + h1 + subtítulo), `Composer.tsx` (caja `Compartí un momento…`), `FeedDivider.tsx` (`PUBLICADO HOY` + línea) y `PhotoPlaceholder.tsx` (caja dashed).
7. **PostCard.** Crear `components/home/PostCard.tsx` que renderiza avatar, nombre+tiempo, badge (color por `type`), audiencia, texto, `PhotoPlaceholder` si aplica, y footer (corazones/comentarios/`Editar`). Compone `PhotoPlaceholder`.
8. **Ensamblar `app/page.tsx`.** Layout `flex`: `Sidebar` (desktop) + `MobileNav` (mobile) + `<main>` scrollable con `FeedHeader`, `Composer`, `FeedDivider` y la lista de `PostCard` mapeada desde `app/_data/mock.ts`. _Prueba: comparar contra `references/pantallas/feed.dc.html` y `references/screenshots/feed.png`._

## Acceptance criteria

- [x] Al abrir `http://localhost:3000/` se renderiza el feed (no el scaffold de create-next-app).
- [x] El fondo de la página es `#F6ECDF` y el texto base es `#3F362E`.
- [x] Los headings (logo, nombres, `Buenas, Caro`, iniciales de avatares) usan Fredoka; el cuerpo usa Nunito.
- [x] El sidebar de desktop muestra logo `OpenDayCare · Sala Soles`, botón `Nueva publicación`, nav con 4 items (`Feed` activo) y tarjeta `Caro Giménez · Maestra · Soles` con botón logout.
- [x] El main muestra el eyebrow `GUARDERÍA · SALA SOLES`, el h1 `Buenas, Caro` y el subtítulo `12 niños · martes 17 jun`.
- [x] Se renderiza el composer `Compartí un momento…` con avatar `C` e ícono de cámara.
- [x] Se renderiza el divisor `PUBLICADO HOY` con su línea.
- [x] Se renderizan exactamente 3 posts con los textos, badges (`LOGRO`/`ACTIVIDAD`/`ANUNCIO`) y audiencias del template.
- [x] El post de actividad muestra el placeholder de foto con borde dashed y la etiqueta `Foto · pintando con témperas`.
- [x] Cada post muestra contador de corazones, contador de comentarios y el link `Editar` (solo visuales).
- [x] En viewport `< md` el sidebar se oculta y un botón hamburguesa abre un drawer con el mismo contenido del sidebar.
- [x] Ningún botón o link del home navega o ejecuta una acción.
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] No hay errores en la consola del navegador al cargar.
- [x] No queda rastro del dark mode heredado ni de las fuentes Geist.

## Decisions

- **Sí:** Tailwind utilities con valores arbitrarios (`bg-[#F6ECDF]`, `rounded-[20px]`) + tokens en `@theme`. Es idiomático al repo (Tailwind v4) y se logra calco pixel-perfect.
- **No:** Portar los `style="..."` inline del template. Iría contra las convenciones del proyecto y dificulta el mantenimiento.
- **Sí:** Fuentes vía `next/font/google` (Fredoka + Nunito). Self-hosted, sin layout shift, idiomático de Next.js 16.
- **No:** `<link>` a Google Fonts como en el template. `next/font` es mejor práctica y evita parpadeo.
- **Sí:** Componentes descompuestos en `components/shared` y `components/home` con subcarpetas semánticas. Separa reutilizables de propios del home y mejora el mantenimiento.
- **No:** Un `app/page.tsx` monolítico. Difícil de mantener y de reutilizar.
- **Sí:** Data mock en `app/_data/mock.ts` (carpeta `_data` excluida de ruteo por el prefijo `_`). Fácil de swapear por API/BD después.
- **No:** Hardcodear los datos dentro de los componentes. Mezcla presentación con datos.
- **Sí:** Botones y links como placeholders visuales no funcionales. El alcance es solo el diseño del home.
- **No:** Implementar handlers o navegación. Requiere las otras pantallas y auth, fuera de scope.
- **Sí:** Responsive con drawer hamburguesa en mobile que reutiliza el contenido del sidebar. Más fiel al template que un bottom-tab bar.
- **No:** Bottom tab bar en mobile. Sería otra maqueta, no "idéntica" al template.
- **Sí:** Remover el dark mode heredado. El template es solo claro.
- **Sí:** `lang="es"` y metadata `OpenDayCare`. El scaffold de create-next-app no aplica.
- **Nota:** Especificación desarrollada y entregada completa para revisión directa en el archivo `.md` (el usuario optó por revisar en archivo en vez de sección por sección en el chat).

## Risks

| Riesgo                                                                                  | Mitigación                                                                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| El calco pixel-perfect con Tailwind puede requerir muchos valores arbitrarios (`[...]`) | Aceptar el trade-off; agrupar los colores recurrentes como tokens en `@theme` para reducir repetición.                         |
| El template no define diseño mobile; el drawer es interpretación                        | Mantener el contenido del sidebar idéntico; solo cambia el contenedor. Fijar el breakpoint en `md` (768px).                    |
| Los SVG inline del template pueden variar sutilmente al componentizar                   | Centralizar en `components/shared/icons.tsx` con los mismos `viewBox` y `stroke-width` del template.                           |
| Las métricas de Fredoka/Nunito vía `next/font` pueden diferir del `<link>` del template | Verificar que carguen los pesos (Fredoka 400/500/600/700, Nunito 400-800) y comparar contra `references/screenshots/feed.png`. |

## What is **not** in this spec

- Autenticación, login y sesiones.
- Base de datos ni persistencia de datos.
- Funcionalidad de botones/links (navegación, crear publicación, editar, reaccionar, comentar, logout).
- Las otras 13 pantallas del catálogo.
- Subida real de fotos (placeholder visual).
- Reacciones y comentarios funcionales.

Cada uno de esos, si llega, va en su propia spec.
