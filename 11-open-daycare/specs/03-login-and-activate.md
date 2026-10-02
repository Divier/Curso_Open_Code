# SPEC 03 — Login y activar cuenta (calco de login.dc.html + activar-cuenta.dc.html)

> **Estado:** Implementado
> **Depende de:** Spec 01 (home-feed) — reutiliza tokens CSS, fuentes y paleta existentes
> **Fecha:** 2026-07-06
> **Objetivo:** Implementar las páginas `(auth)/login` y `(auth)/activate` como calco visual de `login.dc.html` y `activar-cuenta.dc.html` sin lógica de autenticación ni navegación funcional, agrupadas bajo un route group `(auth)` en Next.js.

## Scope

**In:**

- Página `(auth)/login` en `app/(auth)/login/page.tsx` que replica `references/pantallas/login.dc.html`:
  - Layout de dos columnas: panel izquierdo con gradiente (branding, tagline, nombre de guardería) + panel derecho con formulario.
  - Logo `OpenDayCare` con ícono de sol.
  - H1 `El día de cada niño, compartido con su familia.` + subtítulo.
  - Footer del panel izquierdo: `🌿 Guardería Sala Soles`.
  - Panel derecho: h2 `Iniciar sesión` + subtítulo `Ingresá para ver el día de hoy.`
  - Sección `INGRESO COMO` con dos botones: `Personal` (ícono staff) y `Familia` (ícono familia).
  - Campo `EMAIL` con input tipo email.
  - Campo `CONTRASEÑA` con input tipo password.
  - Link `¿Olvidaste tu contraseña?` alineado a la derecha (placeholder visual, sin acción).
  - Botón `Iniciar sesión` con gradiente y sombra.
  - Footer con link `¿Te invitó la guardería? Activá tu cuenta` → `/activate`.
  - Sin selección de rol funcional: los botones Personal/Familia son puramente visuales.

- Página `(auth)/activate` en `app/(auth)/activate/page.tsx` que replica `references/pantallas/activar-cuenta.dc.html`:
  - Layout centrado con fondo `#FBF4EC`.
  - Logo con ícono de sol (gradiente, con sombra).
  - H1 `Bienvenida a OpenDayCare` + subtítulo explicativo.
  - Tarjeta de invitación: avatar `M` + `Te invitaron a seguir a` + `Mateo · Sala Soles`.
  - Campo `CÓDIGO DE INVITACIÓN` con input (texto grande, letter-spacing).
  - Campo `EMAIL` con input tipo email.
  - Campo `CREAR CONTRASEÑA` con input tipo password.
  - Checkbox con texto de autorización de fotos (pre-marcado, visual).
  - Botón `Activar mi cuenta` con gradiente y sombra.
  - Footer con link `¿Ya tenés cuenta? Iniciar sesión` → `/login`.

- Reutilización de fuentes (Fredoka + Nunito) y tokens CSS de `@theme` existentes.
- Nuevos tokens CSS si hacen falta (gradientes, sombras específicas del login).
- Enlaces entre `/login` y `/activate` funcionales (Next.js `Link`).
- Todos los botones de acción (login, activar, forgot password) son placeholders visuales sin handlers reales.
- Estas dos pantallas no tienen que mostrar el sidebar, son independientes.

**Out of scope (para specs futuras):**

- Autenticación real, validación de credenciales, sesiones, JWT, cookies.
- Navegación post-login según rol (staff vs familia).
- Funcionalidad de "¿Olvidaste tu contraseña?".
- Funcionalidad de "Activar mi cuenta" (creación de password, validación de código).
- Persistencia del checkbox de autorización de fotos.
- Selección de rol funcional en login (Personal/Familia).
- Backend, base de datos, API de auth.
- Las demás pantallas del catálogo (feed familia, mi cuenta, etc.).

## Data model

No introduce datos nuevos. Todo es estático y visual. Los inputs tienen valores de ejemplo hardcodeados como en el template.

## Implementation plan

1. **Página `(auth)/login`.** Crear `app/(auth)/login/page.tsx` con layout de dos columnas replicando `login.dc.html`:
   - Panel izquierdo: gradiente `#F6A98E → #F2937A → #EC7E62`, círculos decorativos, logo `OpenDayCare`, h1 tagline, subtítulo, footer `Guardería Sala Soles`.
   - Panel derecho: h2 `Iniciar sesión`, subtítulo, sección `INGRESO COMO` con botones Personal/Familia (visuales), inputs de email y contraseña, link forgot password, botón `Iniciar sesión`, footer con link a `/activate`.
   - Inputs con valores de ejemplo del template (`caro@opendaycare.com`, password placeholder).
   - Botones Personal/Familia con estilos de selección visual (sin lógica de estado).
   - Link `Activá tu cuenta` → `/activate` con `<Link>` de Next.js.
   - _Prueba: `npm run dev`, comparar contra `references/pantallas/login.dc.html`._

2. **Página `(auth)/activate`.** Crear `app/(auth)/activate/page.tsx` replicando `activar-cuenta.dc.html`:
   - Layout centrado con padding.
   - Logo con gradiente y sombra.
   - H1 `Bienvenida a OpenDayCare`, subtítulo.
   - Tarjeta de invitación con avatar `M`, texto `Te invitaron a seguir a`, `Mateo · Sala Soles`.
   - Inputs: código de invitación (`7K4P9`), email (`lucia.fernandez@gmail.com`), contraseña.
   - Checkbox de autorización pre-marcado (estático).
   - Botón `Activar mi cuenta` (placeholder).
   - Link `Iniciar sesión` → `/login` con `<Link>` de Next.js.
   - _Prueba: `npm run dev`, comparar contra `references/pantallas/activar-cuenta.dc.html`._

3. **Tokens CSS nuevos (si hacen falta).** Agregar a `@theme` en `app/globals.css` cualquier gradiente, sombra o color que no exista ya y sea necesario para el calco visual.

4. **Ensamblar y verificar.** `npm run dev`, comparar `/login` contra `references/pantallas/login.dc.html` y `/activate` contra `references/pantallas/activar-cuenta.dc.html`. Ejecutar `npm run lint` y `npx tsc --noEmit`.

## Acceptance criteria

- [x] `http://localhost:3000/login` renderiza el layout de dos columnas con el mismo diseño que `login.dc.html` (ruta `(auth)/login`).
- [x] El panel izquierdo muestra gradiente, logo `OpenDayCare`, tagline, subtítulo y `Guardería Sala Soles`.
- [x] El panel derecho muestra h2 `Iniciar sesión`, subtítulo, botones Personal/Familia, inputs email y contraseña, link forgot password, botón `Iniciar sesión`.
- [x] Los botones Personal y Familia son puramente visuales (no cambian estado ni navegan).
- [x] El link `¿Olvidaste tu contraseña?` es visual sin acción.
- [x] El link `Activá tu cuenta` navega a `/activate`.
- [x] `http://localhost:3000/activate` renderiza el layout centrado con el mismo diseño que `activar-cuenta.dc.html` (ruta `(auth)/activate`).
- [x] La página de activación muestra logo, h1, subtítulo, tarjeta de invitación, inputs (código, email, contraseña), checkbox pre-marcado, botón `Activar mi cuenta`.
- [x] El checkbox de autorización de fotos es visual (pre-marcado, sin lógica).
- [x] El link `Iniciar sesión` en `/activate` navega a `/login`.
- [x] Las fuentes Fredoka y Nunito se usan correctamente en headings y cuerpo.
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] No hay errores en la consola del navegador al cargar ambas páginas.

## Decisions

- **Sí:** Rutas agrupadas bajo `(auth)/login` y `(auth)/activate`. El route group `(auth)` organiza las pantallas de autenticación sin afectar la URL (siguen siendo `/login` y `/activate`). Consistente con la convención de Next.js App Router.
- **Sí:** Botones Personal/Familia como placeholders visuales sin lógica de estado. La autenticación real va en spec futura.
- **Sí:** Link "¿Olvidaste tu contraseña?" sin acción. No hay pantalla de reset password en el catálogo.
- **Sí:** Checkbox de autorización pre-marcado y estático. No se persiste.
- **Sí:** Botones "Iniciar sesión" y "Activar mi cuenta" sin handlers. La lógica de auth va después.
- **Sí:** Enlaces entre `/login` y `/activate` funcionales con `<Link>` de Next.js. Es navegación entre páginas estáticas.
- **No:** Implementar selección de rol con `useState`. El usuario confirmó que es puramente visual.
- **No:** Redirección post-login. No hay auth real aún.

## Risks

| Riesgo                                                                  | Mitigación                                                                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| El layout de dos columnas del login puede no ser responsive             | Mantener grid con `grid-template-columns` como el template; en mobile se puede apilar con `flex-col` si es necesario. |
| Los gradientes y sombras pueden no coincidir exactamente                | Usar valores arbitrarios de Tailwind o inline styles para calco pixel-perfect, igual que en specs anteriores.         |
| El checkbox pre-marcado puede no renderizar igual en todos los browsers | Usar un span estilizado como en el template (no un `<input type="checkbox">` nativo).                                 |

## What is **not** in this spec

- Autenticación real, validación de credenciales, sesiones.
- Navegación post-login según rol.
- Funcionalidad de "¿Olvidaste tu contraseña?".
- Funcionalidad de "Activar mi cuenta".
- Persistencia del checkbox de autorización.
- Selección de rol funcional.
- Backend, base de datos, API.
- Las demás pantallas del catálogo.

Cada uno de esos, si llega, va en su propia spec.
