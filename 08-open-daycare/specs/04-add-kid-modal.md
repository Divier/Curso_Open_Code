# SPEC 04 — Modal para agregar niño (calco de agregar-nino.dc.html como dialog)

> **Estado:** Aprobado
> **Depende de:** SPEC 02 (kids-list-and-profile) — reutiliza data model de `kids.ts`, Sidebar, icons y tokens CSS
> **Fecha:** 2026-07-06
> **Objetivo:** Implementar un modal dialog overlay para agregar un niño nuevo desde la página `/kids`, replicando el diseño de `agregar-nino.dc.html` con validación de campos obligatorios y máscara de fecha.

## Scope

**In:**

- Componente `AddKidModal` en `components/kids/AddKidModal.tsx` que replica `references/pantallas/agregar-nino.dc.html` como un dialog/modal overlay:
  - Backdrop oscuro semitransparente que cierra el modal al hacer click fuera.
  - Tecla `Esc` cierra el modal.
  - Header del modal: link `Cancelar` (izquierda), título `Agregar niño` (centro, Fredoka), botón `Guardar` (derecha, accent).
  - Formulario con campos:
    - **NOMBRE COMPLETO** (input texto, placeholder "Ej. Martina López") — **obligatorio**.
    - **FECHA DE NACIMIENTO** (input texto con máscara `dd/mm/aaaa`) — **obligatorio**.
    - **SALA** (select con opciones mock: "Soles", "Estrellas", "Arcoíris") — **obligatorio**.
    - **ALERGIAS (ETIQUETAS)** (input texto libre, placeholder "Ej. Maní, Lactosa") — opcional.
    - **NOTAS MÉDICAS** (textarea, placeholder "Indicaciones, medicación, contactos…") — opcional.
  - Validación al intentar guardar: nombre, fecha y sala son obligatorios. Si falta alguno, mostrar mensaje de error debajo del campo correspondiente.
  - Al guardar exitosamente: cerrar el modal y agregar el niño a la lista mock en memoria (con ID generado, iniciales, avatar color aleatorio, sin padres vinculados).
- Integración del modal en `app/kids/page.tsx`: el botón "Agregar niño" abre el modal en lugar de ser un link `href="#"`.
- Máscara de fecha: el input de fecha formatea automáticamente mientras el usuario escribe (`dd/mm/aaaa`), aceptando solo dígitos y agregando `/` en las posiciones correctas. Máximo 10 caracteres.
- Reutilización de tokens CSS existentes (`@theme`) y paleta del proyecto.

**Out of scope (para specs futuras):**

- Persistencia real del niño agregado (se pierde al recargar la página).
- Página separada de editar niño (`agregar-nino.dc.html` como ruta, no como modal).
- Página `vincular-padre.dc.html`.
- Página `resumen-dia.dc.html`.
- Backend, base de datos, API.
- Upload de foto del niño.
- Las demás pantallas del catálogo.

## Data model

Reutiliza el modelo existente en `app/_data/kids.ts`. El modal agrega un nuevo `Kid` al array `kids` en memoria.

```ts
// El nuevo Kid se construye a partir del formulario:
const newKid: Kid = {
  id: slugify(fullName), // ej. "martina-lopez"
  firstName: splitName(fullName)[0],
  lastName: splitName(fullName).slice(1).join(' '),
  fullName,
  initial: fullName.charAt(0).toUpperCase(),
  age: calculateAge(birthDate), // derivado de la fecha
  room: selectedRoom, // "Soles" | "Estrellas" | "Arcoíris"
  birthDate: formattedBirthDate, // "12 mar 2022" style
  enrollmentDate: currentMonthYear, // "jul 2026"
  allergies: parseAllergiesInput, // mapeo de texto libre a AllergyType[]
  medicalNotes: medicalNotesInput,
  linkedParents: [],
  avatarBg: randomAvatarBg(), // color aleatorio de la paleta existente
  avatarColor: randomAvatarColor(),
};
```

Helpers nuevos en `app/_data/kids.ts`:

- `addKidToMock(kid: Kid): void` — agrega al array `kids`.
- `generateKidId(fullName: string): string` — slugify del nombre completo.
- `calculateAge(birthDate: string): number` — calcula edad desde `dd/mm/aaaa`.
- `formatBirthDateDisplay(ddmmyyyy: string): string` — convierte "15/03/2023" a "15 mar 2023".
- `parseAllergyText(text: string): AllergyType[]` — mapea texto libre a tipos conocidos (case-insensitive, "maní" → `peanut`, "lactosa" → `lactose`, "gluten" → `gluten`).

## Implementation plan

1. **Helpers de data.** Agregar a `app/_data/kids.ts` los helpers `addKidToMock`, `generateKidId`, `calculateAge`, `formatBirthDateDisplay`, `parseAllergyText` y los colores de avatar disponibles. _Prueba: importar y ejecutar manualmente._

2. **Componente `AddKidModal`.** Crear `components/kids/AddKidModal.tsx`:
   - Props: `{ open: boolean; onClose: () => void; onAdd: (kid: Kid) => void }`.
   - Usa `useEffect` para escuchar `Esc` y cerrar.
   - Backdrop con `fixed inset-0 bg-black/40` que cierra al click.
   - Panel centrado con los estilos del template (max-width 520px, fondo `#FBF4EC`, bordes redondeados 24px, sombra).
   - Header: `Cancelar` (gris), título `Agregar niño` (Fredoka), `Guardar` (accent `#D9583C`).
   - Formulario con estado local (`useState`) para cada campo.
   - Máscara de fecha: handler `onChange` que inserta `/` automáticamente, permite solo dígitos, máximo 10 chars.
   - Validación al guardar: si nombre vacío, fecha incompleta (menos de 10 chars) o sala no seleccionada → mostrar error debajo del campo en rojo.
   - Si todo válido: construir `Kid`, llamar `onAdd`, limpiar formulario, cerrar modal.
   - _Prueba: renderizar con `open={true}` en un wrapper temporal._

3. **Integrar en `/kids`.** Actualizar `app/kids/page.tsx`:
   - Cambiar el botón "Agregar niño" de `<a href="#">` a `<button>` con `onClick` que abre el modal.
   - Agregar estado `showAddKid` y el componente `<AddKidModal>`.
   - Handler `onAdd` que llama a `addKidToMock` del data mock.
   - _Prueba: click en botón → modal aparece; cancelar/Esc/backdrop → modal cierra; guardar válido → modal cierra y nuevo kid aparece en la lista._

4. **Tokens CSS nuevos (si hacen falta).** Agregar a `@theme` en `app/globals.css` cualquier color de error de validación o estilo adicional necesario.

5. **Ensamblar y verificar.** `npm run dev`, comparar el modal abierto contra `references/pantallas/agregar-nino.dc.html`. Ejecutar `npm run lint` y `npx tsc --noEmit`.

## Acceptance criteria

- [x] El botón "Agregar niño" en `/kids` abre un modal overlay (no navega a otra ruta).
- [x] El modal muestra un backdrop oscuro semitransparente detrás del formulario.
- [x] Click en el backdrop cierra el modal.
- [x] Presionar `Esc` cierra el modal.
- [x] El header del modal muestra `Cancelar` (gris), `Agregar niño` (Fredoka, centro), `Guardar` (accent, derecha).
- [x] Click en `Cancelar` cierra el modal.
- [x] El formulario tiene los 5 campos: nombre completo, fecha de nacimiento, sala, alergias, notas médicas.
- [x] El input de fecha aplica máscara automática `dd/mm/aaaa` mientras se escribe (solo dígitos, `/` insertados automáticamente).
- [x] El campo sala es un `<select>` con al menos 3 opciones: "Soles", "Estrellas", "Arcoíris".
- [x] Al intentar guardar con nombre vacío, se muestra un mensaje de error debajo del campo.
- [x] Al intentar guardar con fecha incompleta (menos de 10 caracteres), se muestra un mensaje de error debajo del campo.
- [x] Al intentar guardar sin sala seleccionada, se muestra un mensaje de error debajo del campo.
- [x] Al guardar con todos los campos obligatorios completos, el modal se cierra y el nuevo niño aparece en la lista de `/kids`.
- [x] El niño agregado tiene avatar con inicial, edad calculada, sala correcta y badge de alergia si aplica.
- [x] Los campos alergias y notas médicas son opcionales (no bloquean el guardado).
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] No hay errores en la consola del navegador al abrir y cerrar el modal.

## Decisions

- **Sí:** Modal overlay con backdrop y cierre por Esc/click fuera/backdrop. Es el patrón estándar de dialog y evita navegación.
- **Sí:** Validación de campos obligatorios (nombre, fecha, sala) al momento de guardar. El usuario lo pidió explícitamente.
- **Sí:** Máscara de fecha `dd/mm/aaaa` con inserción automática de `/`. Mejora la UX y evita formatos inválidos.
- **Sí:** Select de sala con 3 opciones mock ("Soles", "Estrellas", "Arcoíris"). Preparado para cuando haya más salas reales.
- **Sí:** Alergias como texto libre. Flexible y no requiere mantener un catálogo fijo de alergias.
- **Sí:** El niño agregado se guarda solo en memoria (array mock). Se pierde al recargar, pero es suficiente para la UI actual.
- **No:** Persistencia del niño agregado (localStorage, IndexedDB, backend). Va en spec de persistencia.
- **No:** Página separada de editar niño. El modal es solo para agregar. Editar va en otra spec.
- **No:** Cálculo automático de edad desde la fecha en la UI de la lista. Se calcula al crear el Kid mock.

## What is **not** in this spec

- Persistencia real del niño agregado (se pierde al recargar).
- Página de editar niño.
- Página `vincular-padre`.
- Página `resumen-dia`.
- Backend, base de datos, API.
- Upload de foto del niño.
- Las demás pantallas del catálogo.

Cada uno de esos, si llega, va en su propia spec.
