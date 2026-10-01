# SPEC 02 — Kids list and profile pages (calco de ninos.dc.html + perfil-nino.dc.html)

> **Estado:** aprobado
> **Depende de:** Spec 01 (home-feed) — reutiliza Sidebar, MobileNav, icons.tsx y tokens CSS
> **Fecha:** 2026-07-03
> **Objetivo:** Implementar las páginas `/kids` (lista de niños con búsqueda frontend) y `/kids/[id]` (perfil individual con alergias, datos y padres vinculados) reutilizando componentes existentes y datos mock.

## Scope

**In:**

- Página `/kids` en `app/kids/page.tsx` que replica `references/pantallas/ninos.dc.html`:
  - Eyebrow `GESTIÓN` + h1 `Niños` + botón `Agregar niño` (placeholder).
  - Buscador `Buscar niño…` con filtrado frontend por nombre.
  - Sección `SALA SOLES` con contador de niños.
  - Grid de 2 columnas con tarjetas de niño (avatar con inicial, nombre, edad, padres vinculados, badge de alergia o flecha).
  - Hover con `translateY(-2px)` y cambio de borde.
- Página `/kids/[id]` en `app/kids/[id]/page.tsx` que replica `references/pantallas/perfil-nino.dc.html`:
  - Link `Volver a Niños` → `/kids`.
  - Avatar grande + nombre + edad/sala + botón `Editar` (placeholder).
  - Tarjeta de alergias y notas médicas.
  - Tabla de datos: fecha de nacimiento, sala, ingreso.
  - Sidebar derecho: botón `Resumen del día` (placeholder) + sección `PADRES VINCULADOS` con estado (activa/pendiente) + link `Vincular otro padre` (placeholder).
- Data mock de 8 niños en `app/_data/kids.ts` con tipos, enums de alergia y colores.
- Iconos nuevos en `components/shared/icons.tsx`: Search, ChevronRight, ChevronLeft, AlertTriangle, Edit.
- Nav activo actualizado: `Niños` activo en `/kids` y `/kids/[id]`, `Feed` activo en `/`.
- Reutilización de `Sidebar`, `MobileNav` y tokens CSS existentes.
- Colores de alergia como enum con mapeo a colores visuales.

**Out of scope (para specs futuras):**

- Página `agregar-nino.dc.html` (crear/editar niño).
- Página `vincular-padre.dc.html` (invitar padre por código).
- Página `resumen-dia.dc.html` (resumen del día).
- Funcionalidad real de botones `Agregar niño`, `Editar`, `Vincular otro padre`, `Resumen del día`: placeholders visuales.
- Backend, base de datos, persistencia.
- Autenticación o roles.
- Búsqueda server-side o conexión a API.
- Upload de foto de perfil del niño.
- Las demás pantallas del catálogo (`avisos`, `mi-cuenta`, `familia-*`, etc.).

## Data model

Datos mock en `app/_data/kids.ts`. No hay persistencia: todo es estático y en memoria.

```ts
// Allergy types with visual labels and colors (Spanish UI, English data).
export type AllergyType = 'peanut' | 'lactose' | 'gluten' | 'none';

export const ALLERGY_LABEL: Record<AllergyType, string> = {
  peanut: 'MANÍ',
  lactose: 'LACTOSA',
  gluten: 'GLUTEN',
  none: '',
};

export const ALLERGY_BADGE: Record<AllergyType, { bg: string; color: string }> =
  {
    peanut: { bg: '#FBD8CC', color: '#D9684A' },
    lactose: { bg: '#FBD8CC', color: '#D9684A' },
    gluten: { bg: '#F9D2DE', color: '#C56486' },
    none: { bg: 'transparent', color: 'transparent' },
  };

// Parent status.
export type ParentStatus = 'active' | 'pending';

export const PARENT_STATUS_LABEL: Record<ParentStatus, string> = {
  active: 'ACTIVA',
  pending: 'PENDIENTE',
};

export const PARENT_STATUS_BADGE: Record<
  ParentStatus,
  { bg: string; color: string }
> = {
  active: { bg: '#CFEBD8', color: '#3E9B6C' },
  pending: { bg: '#F7E7A6', color: '#9A7B1E' },
};

export interface LinkedParent {
  name: string;
  initial: string;
  role: string; // "Mamá" | "Papá"
  status: ParentStatus;
  avatarBg: string;
  avatarColor: string;
}

export interface Kid {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string; // "Mateo Fernández"
  initial: string; // "M"
  age: number; // 3
  room: string; // "Soles"
  birthDate: string; // "12 mar 2022"
  enrollmentDate: string; // "feb 2025"
  allergies: AllergyType[]; // ['peanut']
  medicalNotes: string; // "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila."
  linkedParents: LinkedParent[];
  avatarBg: string;
  avatarColor: string;
}

// 8 kids matching the template.
export const kids: Kid[] = [
  {
    id: 'mateo-fernandez',
    firstName: 'Mateo',
    lastName: 'Fernández',
    fullName: 'Mateo Fernández',
    initial: 'M',
    age: 3,
    room: 'Soles',
    birthDate: '12 mar 2022',
    enrollmentDate: 'feb 2025',
    allergies: ['peanut'],
    medicalNotes:
      'Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.',
    linkedParents: [
      {
        name: 'Lucía Fernández',
        initial: 'L',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#C9B6E8',
        avatarColor: '#7B5FC0',
      },
      {
        name: 'Diego Fernández',
        initial: 'D',
        role: 'Papá',
        status: 'pending',
        avatarBg: '#A9C7E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#A9D9E8',
    avatarColor: '#1F7A93',
  },
  {
    id: 'sofia-mendez',
    firstName: 'Sofía',
    lastName: 'Méndez',
    fullName: 'Sofía Méndez',
    initial: 'S',
    age: 2,
    room: 'Soles',
    birthDate: '5 ago 2023',
    enrollmentDate: 'mar 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Ana Méndez',
        initial: 'A',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#F4B8CC',
        avatarColor: '#C44A7A',
      },
    ],
    avatarBg: '#F4B8CC',
    avatarColor: '#C44A7A',
  },
  {
    id: 'benjamin-ruiz',
    firstName: 'Benjamín',
    lastName: 'Ruiz',
    fullName: 'Benjamín Ruiz',
    initial: 'B',
    age: 3,
    room: 'Soles',
    birthDate: '22 ene 2022',
    enrollmentDate: 'feb 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Carolina Ruiz',
        initial: 'C',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#B9DEC4',
        avatarColor: '#3E8B62',
      },
      {
        name: 'Martín Ruiz',
        initial: 'M',
        role: 'Papá',
        status: 'active',
        avatarBg: '#A9D9E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#B9DEC4',
    avatarColor: '#3E8B62',
  },
  {
    id: 'valentina-soto',
    firstName: 'Valentina',
    lastName: 'Soto',
    fullName: 'Valentina Soto',
    initial: 'V',
    age: 2,
    room: 'Soles',
    birthDate: '14 nov 2023',
    enrollmentDate: 'abr 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [],
    avatarBg: '#F4DC8E',
    avatarColor: '#9A7B1E',
  },
  {
    id: 'tomas-diaz',
    firstName: 'Tomás',
    lastName: 'Díaz',
    fullName: 'Tomás Díaz',
    initial: 'T',
    age: 3,
    room: 'Soles',
    birthDate: '3 jul 2022',
    enrollmentDate: 'feb 2025',
    allergies: ['lactose'],
    medicalNotes:
      'Intolerancia a la lactosa. Llevar leche sin lactosa en la lonchera.',
    linkedParents: [
      {
        name: 'Rosa Díaz',
        initial: 'R',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#C9B6E8',
        avatarColor: '#7B5FC0',
      },
    ],
    avatarBg: '#C9B6E8',
    avatarColor: '#7B5FC0',
  },
  {
    id: 'emma-castro',
    firstName: 'Emma',
    lastName: 'Castro',
    fullName: 'Emma Castro',
    initial: 'E',
    age: 2,
    room: 'Soles',
    birthDate: '19 sep 2023',
    enrollmentDate: 'mar 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Laura Castro',
        initial: 'L',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#F4B8CC',
        avatarColor: '#C44A7A',
      },
    ],
    avatarBg: '#F4B8CC',
    avatarColor: '#C44A7A',
  },
  {
    id: 'lucas-romero',
    firstName: 'Lucas',
    lastName: 'Romero',
    fullName: 'Lucas Romero',
    initial: 'L',
    age: 3,
    room: 'Soles',
    birthDate: '8 may 2022',
    enrollmentDate: 'feb 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Pablo Romero',
        initial: 'P',
        role: 'Papá',
        status: 'active',
        avatarBg: '#A9D9E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#A9D9E8',
    avatarColor: '#1F7A93',
  },
  {
    id: 'olivia-vega',
    firstName: 'Olivia',
    lastName: 'Vega',
    fullName: 'Olivia Vega',
    initial: 'O',
    age: 2,
    room: 'Soles',
    birthDate: '30 dic 2023',
    enrollmentDate: 'abr 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Marta Vega',
        initial: 'M',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#B9DEC4',
        avatarColor: '#3E8B62',
      },
    ],
    avatarBg: '#B9DEC4',
    avatarColor: '#3E8B62',
  },
];

// Helper: find kid by id.
export function getKidById(id: string): Kid | undefined {
  return kids.find((k) => k.id === id);
}

// Helper: count linked parents label for the card.
export function parentCountLabel(parents: LinkedParent[]): string {
  const n = parents.length;
  if (n === 0) return 'sin padres vinculados';
  if (n === 1) return '1 padre vinculado';
  return `${n} padres vinculados`;
}
```

Convenciones:

- Los badges de alergia en la lista de niños se derivan del primer elemento de `allergies`. Si no hay alergias, se muestra un chevron-right. Si hay padres sin vincular (0 padres), se muestra badge `VINCULAR`.
- Los colores de alergia son fijos por tipo; eventualmente vendrán de la base de datos.
- Los `href` de `Agregar niño`, `Editar`, `Vincular otro padre`, `Resumen del día` quedan como `#` (placeholders no funcionales).

## Implementation plan

1. **Data mock de niños.** Crear `app/_data/kids.ts` con los tipos `AllergyType`, `LinkedParent`, `Kid`, el array de 8 niños y los helpers `getKidById` y `parentCountLabel`. _Prueba: importar sin romper._

2. **Iconos nuevos.** Agregar a `components/shared/icons.tsx`: `SearchIcon` (lupa), `ChevronRightIcon`, `ChevronLeftIcon`, `AlertTriangleIcon` (alerta alergias), `EditIcon` (lápiz). _Prueba: importar desde un componente._

3. **Tokens CSS nuevos.** Agregar a `@theme` en `app/globals.css` los colores de badges de alergia (`allergy-warm`, `allergy-pink`), estado de padres (`parent-active`, `parent-pending`) y el fondo del form (`canvas-warm` `#FBF4EC`).

4. **Página `/kids`.** Crear `app/kids/page.tsx` con layout completo (Sidebar + MobileNav + main):
   - Eyebrow `GESTIÓN` + h1 `Niños` + botón `Agregar niño` (`href="#"`).
   - Buscador con input controlado (`useState`) que filtra por `fullName` (case-insensitive).
   - Sección `SALA SOLES` con contador de niños visibles tras el filtro.
   - Grid 2 columnas con `KidCard` por cada niño filtrado.

5. **Componente `KidCard`.** Crear `components/kids/KidCard.tsx`:
   - Avatar con inicial, nombre, `edad · padres label`.
   - Si tiene alergias → badge con color del primer tipo.
   - Si no tiene padres vinculados → badge `VINCULAR`.
   - Si no → chevron-right.
   - Link a `/kids/[id]`.
   - Hover con `translateY(-2px)` y `border-color` change.

6. **Página `/kids/[id]`.** Crear `app/kids/[id]/page.tsx` con layout completo:
   - Lee `params.id`, busca el kid con `getKidById`. Si no existe, muestra fallback simple.
   - Link `Volver a Niños` → `/kids`.
   - Columna izquierda: avatar grande + nombre + edad/sala + botón `Editar` (`href="#"`).
   - Tarjeta de alergias (fondo cálido, ícono alerta, texto).
   - Tabla de datos (fecha nacimiento, sala, ingreso).
   - Columna derecha (300px): botón `Resumen del día` (`href="#"`) + sección `PADRES VINCULADOS` con lista de padres (avatar, nombre, rol, badge de estado) + link `Vincular otro padre` (`href="#"`).

7. **Nav activo por ruta.** Actualizar `navItems` en `mock.ts` o crear un helper `getActiveNav(pathname)` para que `Niños` esté activo en `/kids` y `/kids/[id]`, y `Feed` activo en `/`. Actualizar `Sidebar.tsx` para usar este helper.

8. **Ensamblar y verificar.** `npm run dev`, comparar `/kids` contra `references/pantallas/ninos.dc.html` y `/kids/mateo-fernandez` contra `references/pantallas/perfil-nino.dc.html`. Ejecutar `npm run lint` y `npx tsc --noEmit`.

## Acceptance criteria

- [x] `http://localhost:3000/kids` renderiza la lista de niños con el mismo diseño que `ninos.dc.html`.
- [x] El sidebar muestra `Niños` como activo cuando se está en `/kids` o `/kids/[id]`.
- [x] El sidebar muestra `Feed` como activo cuando se está en `/`.
- [x] El buscador filtra niños por nombre en tiempo real (frontend, sin backend).
- [x] Se muestran 8 niños en un grid de 2 columnas.
- [x] Cada tarjeta muestra avatar con inicial, nombre, edad, padres vinculados, y badge de alergia o flecha o `VINCULAR`.
- [x] Hover en tarjeta produce `translateY(-2px)` y cambio de borde.
- [x] Click en una tarjeta navega a `/kids/[id]`.
- [x] `http://localhost:3000/kids/mateo-fernandez` renderiza el perfil con el mismo diseño que `perfil-nino.dc.html`.
- [x] El perfil muestra avatar grande, nombre, edad/sala, botón Editar (placeholder).
- [x] El perfil muestra la tarjeta de alergias con ícono y texto.
- [x] El perfil muestra la tabla de datos (fecha nacimiento, sala, ingreso).
- [x] El perfil muestra la sección `PADRES VINCULADOS` con badges de estado (ACTIVA/PENDIENTE).
- [x] El perfil muestra el botón `Resumen del día` y el link `Vincular otro padre` como placeholders.
- [x] El link `Volver a Niños` en el perfil navega a `/kids`.
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] No hay errores en la consola del navegador al cargar ambas páginas.

## Decisions

- **Sí:** Rutas `/kids` y `/kids/[id]` en inglés. Mantiene consistencia con la convención del proyecto (código en inglés, UI en español).
- **Sí:** Reutilizar `Sidebar`, `MobileNav` e `icons.tsx` existentes. Evita duplicación y mantiene consistencia visual.
- **Sí:** Datos de niños en archivo separado `app/_data/kids.ts`. `mock.ts` ya tiene datos del feed; separar mejora el mantenimiento.
- **Sí:** Búsqueda frontend con `useState` + `filter`. No hay backend aún; es suficiente para la UI.
- **Sí:** Enum `AllergyType` con colores fijos. Eventualmente vendrán de la base de datos, pero por ahora simplifica la UI.
- **No:** Implementar formularios de crear/editar niño (`agregar-nino.dc.html`). Fuera de scope; va en spec futura.
- **No:** Funcionalidad real de botones `Editar`, `Vincular otro padre`, `Resumen del día`. Placeholders visuales.
- **Sí:** Badge `VINCULAR` cuando no hay padres vinculados. Señal visual clara del template.
- **Sí:** Chevron-right cuando no hay alergia ni necesidad de vincular. Indica que se puede hacer click.

## Risks

| Riesgo                                                      | Mitigación                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| El filtro de búsqueda puede no coincidir con acentos/tildes | Usar `toLowerCase()` y `normalize('NFD').replace(/[\u0300-\u036f]/g, '')` para comparación. |
| Los colores de alergia hardcodeados pueden no escalar       | Centralizar en `ALLERGY_BADGE` map; fácil de migrar a DB después.                           |
| El perfil con dos columnas puede no ser responsive          | Mantener layout flex-wrap; en mobile las columnas se apilan verticalmente.                  |
| `params.id` no existe en la data mock                       | Mostrar fallback simple ("Niño no encontrado") con link a `/kids`.                          |

## What is **not** in this spec

- Página `agregar-nino` (crear/editar niño).
- Página `vincular-padre` (invitar padre).
- Página `resumen-dia` (resumen del día).
- Funcionalidad real de botones y links (solo placeholders visuales).
- Backend, base de datos, persistencia.
- Autenticación o roles.
- Upload de foto de perfil.
- Las demás pantallas del catálogo.

Cada uno de esos, si llega, va en su propia spec.
