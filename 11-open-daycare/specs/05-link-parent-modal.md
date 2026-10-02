# SPEC 05 — Modal de vincular padre (calco de vincular-padre.dc.html como dialog)

> **Estado:** implementado
> **Depende de:** SPEC 02 (kids-list-and-profile) — reutiliza data model de `kids.ts`, tipos `LinkedParent`, `ParentStatus`, tokens CSS y la página `/kids/[id]`
> **Fecha:** 2026-07-07
> **Objetivo:** Implementar un modal dialog overlay para vincular un padre/madre/tutor a un niño desde la página `/kids/[id]`, replicando el diseño de `vincular-padre.dc.html` con validación de nombre y email, y al enviar agregar un padre "pendiente" al mock del niño.

## Scope

**In:**

- Componente `LinkParentModal` en `components/kids/LinkParentModal.tsx` que replica `references/pantallas/vincular-padre.dc.html` como un dialog/modal overlay:
  - Backdrop oscuro semitransparente que cierra el modal al hacer click fuera.
  - Tecla `Esc` cierra el modal.
  - Header del modal: título `Vincular padre` (Fredoka) + subtítulo `a {nombre del niño}` + botón X de cierre (esquina superior derecha).
  - Banner informativo azul con ícono de info: "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {nombre del niño}."
  - Formulario con campos:
    - **NOMBRE DEL PADRE/MADRE** (input texto, placeholder "Ej. Diego Fernández") — **obligatorio**.
    - **EMAIL** (input tipo email, placeholder "correo@ejemplo.com") — **obligatorio**, validación de formato email con regex.
    - **PARENTESCO** (3 botones toggle: "Mamá", "Papá", "Tutor/a") — **obligatorio**, solo uno seleccionado a la vez. Por defecto "Mamá" pre-seleccionado.
    - **CÓDIGO DE INVITACIÓN** (tarjeta visual con código hardcodeado `7K4P9`, texto "Vence en 7 días") — solo visual, no editable.
  - Botón `Enviar invitación` con gradiente accent y ícono de avión de papel.
  - Validación al intentar enviar: nombre no vacío, email válido (regex), parentesco seleccionado. Si falta algo, mostrar mensaje de error debajo del campo correspondiente.
  - Al enviar exitosamente: cerrar el modal y agregar un `LinkedParent` con status `pending` al array `linkedParents` del niño en el mock.
- Integración del modal en `app/kids/[id]/page.tsx`: el link "Vincular otro padre" se convierte en un `<button>` que abre el modal.
- Reutilización de tokens CSS existentes (`@theme`) y paleta del proyecto.
- El nombre del niño se pasa como prop al modal para personalizar el subtítulo y el banner informativo.

**Out of scope (para specs futuras):**

- Envío real de email con código de activación.
- Página de activación de cuenta del padre invitado.
- Persistencia real del padre vinculado (se pierde al recargar).
- Lógica de negocio para verificar si el email ya existe en el sistema.
- Backend, base de datos, API.
- Las demás pantallas del catálogo.

## Data model

Reutiliza el modelo existente en `app/_data/kids.ts`. El modal agrega un nuevo `LinkedParent` al array `linkedParents` del niño seleccionado.

```ts
// El nuevo LinkedParent se construye a partir del formulario:
const newParent: LinkedParent = {
  name: parentName, // ej. "Diego Fernández"
  initial: parentName.charAt(0).toUpperCase(), // "D"
  role: selectedRole, // "Mamá" | "Papá" | "Tutor/a"
  status: 'pending' as ParentStatus,
  avatarBg: randomAvatarBg(), // color aleatorio de la paleta existente
  avatarColor: randomAvatarColor(),
};

// Se agrega al niño:
kid.linkedParents.push(newParent);
```

Helper nuevo en `app/_data/kids.ts`:

- `isValidEmail(email: string): boolean` — valida formato de email con regex simple.

## Implementation plan

1. **Helper de validación de email.** Agregar a `app/_data/kids.ts` la función `isValidEmail(email: string): boolean` con regex estándar. _Prueba: importar y ejecutar manualmente con emails válidos e inválidos._

2. **Componente `LinkParentModal`.** Crear `components/kids/LinkParentModal.tsx`:
   - Props: `{ open: boolean; kidName: string; onClose: () => void; onLink: (parent: LinkedParent) => void }`.
   - Usa `useEffect` para escuchar `Esc` y cerrar.
   - Backdrop con `fixed inset-0 bg-black/40` que cierra al click.
   - Panel centrado con los estilos del template (max-width 480px, fondo `#FBF4EC`, bordes redondeados 24px, sombra).
   - Header: título `Vincular padre` + subtítulo `a {kidName}` + botón X de cierre.
   - Banner informativo azul (`#E3ECFB`) con ícono info y texto dinámico.
   - Formulario con estado local (`useState`) para nombre, email y parentesco.
   - Parentesco: 3 botones con estilo toggle (el seleccionado tiene fondo azul claro `#CCD8F4` + borde azul `#9FB8EC`, los no seleccionados tienen fondo claro `#FFFDF9` + borde neutro).
   - Código de invitación hardcodeado `7K4P9` en tarjeta con fondo `#FBF1D6` y borde dashed.
   - Validación al enviar: si nombre vacío → error; si email vacío o inválido → error; si parentesco no seleccionado → error.
   - Si todo válido: construir `LinkedParent`, llamar `onLink`, limpiar formulario, cerrar modal.
   - _Prueba: renderizar con `open={true}` en un wrapper temporal._

3. **Integrar en `/kids/[id]`.** Actualizar `app/kids/[id]/page.tsx`:
   - Cambiar el link `<a href="#">` de "Vincular otro padre" a `<button>` con `onClick` que abre el modal.
   - Agregar estado `showLinkParent` y el componente `<LinkParentModal>`.
   - Handler `onLink` que agrega el nuevo padre al `linkedParents` del kid mock.
   - _Prueba: click en botón → modal aparece; cancelar/Esc/backdrop → modal cierra; enviar válido → modal cierra y nuevo padre aparece en la lista de PADRES VINCULADOS._

4. **Tokens CSS nuevos (si hacen falta).** Agregar a `@theme` en `app/globals.css` cualquier color del banner informativo o estilo adicional necesario.

5. **Ensamblar y verificar.** `npm run dev`, comparar el modal abierto contra `references/pantallas/vincular-padre.dc.html`. Ejecutar `npm run lint` y `npx tsc --noEmit`.

## Acceptance criteria

- [x] El botón "Vincular otro padre" en `/kids/[id]` abre un modal overlay (no navega a otra ruta).
- [x] El modal muestra un backdrop oscuro semitransparente detrás del formulario.
- [x] Click en el backdrop cierra el modal.
- [x] Presionar `Esc` cierra el modal.
- [x] El header del modal muestra `Vincular padre` (Fredoka), subtítulo `a {nombre del niño}`, y botón X de cierre.
- [x] Click en el botón X cierra el modal.
- [x] El banner informativo azul muestra el texto "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {nombre del niño}."
- [x] El formulario tiene los campos: nombre del padre/madre, email, parentesco (3 botones), código de invitación.
- [x] El input de email valida formato con regex y muestra error si es inválido.
- [x] Los 3 botones de parentesco funcionan como toggle (solo uno seleccionado a la vez).
- [x] El código de invitación muestra `7K4P9` hardcodeado con texto "Vence en 7 días".
- [x] Al intentar enviar con nombre vacío, se muestra un mensaje de error debajo del campo.
- [x] Al intentar enviar con email vacío o inválido, se muestra un mensaje de error debajo del campo.
- [x] Al enviar con todos los campos válidos, el modal se cierra y el nuevo padre aparece en la lista de PADRES VINCULADOS con estado PENDIENTE.
- [x] El padre agregado tiene avatar con inicial, rol correcto y badge `PENDIENTE`.
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] No hay errores en la consola del navegador al abrir y cerrar el modal.

## Decisions

- **Sí:** Modal overlay con backdrop y cierre por Esc/click fuera/backdrop/botón X. Mismo patrón que `AddKidModal`.
- **Sí:** Validación de campos obligatorios (nombre, email, parentesco) al momento de enviar. El usuario lo pidió explícitamente.
- **Sí:** Validación de formato email con regex estándar. Evita emails mal formados.
- **Sí:** Parentesco como 3 botones toggle con "Mamá" pre-seleccionado por defecto. Mejora la UX vs un select.
- **Sí:** Código de invitación hardcodeado `7K4P9`. Es solo visual, la lógica real va en spec futura.
- **Sí:** El padre agregado se guarda solo en memoria (array mock). Se pierde al recargar, pero es suficiente para la UI actual.
- **Sí:** Permitir duplicar roles de parentesco. En la vida real puede haber múltiples mamás/papás.
- **No:** Envío real de email con código de activación. Va en spec de autenticación/invitaciones.
- **No:** Verificación de email duplicado. No hay backend aún.
- **No:** Página de activación de cuenta del padre invitado. Va en spec futura.

## What is **not** in this spec

- Envío real de email con código de activación.
- Página de activación de cuenta del padre invitado.
- Persistencia real del padre vinculado (se pierde al recargar).
- Verificación de email duplicado.
- Backend, base de datos, API.
- Las demás pantallas del catálogo.

Cada uno de esos, si llega, va en su propia spec.
