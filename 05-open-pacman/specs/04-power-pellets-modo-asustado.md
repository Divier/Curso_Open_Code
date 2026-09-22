# SPEC 04 — Power pellets y modo asustado

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03
> **Fecha:** 2026-09-22
> **Objetivo:** Añadir los 4 power pellets parpadeantes del arcade, que activan un modo asustado de 6 s con fantasmas azules, lentos y erráticos que Pac-Man puede comer por 200/400/800/1600, devolviéndolos a la pen como ojos que reviven y vuelven a salir.

## Por qué existe esta spec

SPEC 01 y SPEC 02 apartaron expresamente "modo asustado, power pellets y fantasmas comestibles" a una spec futura. Esta es esa spec: la mecánica que falta del arcade. Aterriza sobre tres piezas ya implementadas: personalidades (SPEC 01), flujo de salida de la pen (SPEC 02) y gate de espera `waitFrames` (SPEC 03).

## Alcance

**Dentro:**

- Tile 4 (`'o'`) en `src/js/maze.js`: power pellets en las 4 posiciones clásicas (1,3), (26,3), (1,23), (26,23) — hoy dots; simetría 13/14 intacta.
- Comer pellet: +50 puntos, cuenta para ganar (`dotsRemaining` suma tiles 2 y 4), y dibujo como dot grande parpadeante (~0.25 s por fase) en `src/js/render.js`.
- Modo asustado en `src/js/game.js`: 360 frames (6 s), media vuelta de todos los fantasmas no comidos al activarse, velocidad 1/20, dirección al azar en cruces, aviso visual final (2 s) y restauración completa al expirar.
- Comer fantasmas: cadena 200/400/800/1600 (`ghostEatChain`, reinicia con cada pellet), congelado de 30 frames con la cifra pintada en el lugar del fantasma.
- Ojos: el fantasma comido vuelve caminando (greedy) a su celda de inicio, rápido (1/5), re-entrando a la pen como única excepción al bloqueo de SPEC 02; al llegar revive, re-aplica su retardo de salida de SPEC 03 y no vuelve a asustarse hasta el siguiente pellet (`exempt`).
- Colisiones: ojos inofensivos; la muerte de Pac-Man limpia todo el estado nuevo (`resetPositions`).
- Modo global: los fantasmas esperando en la pen también se pintan azules y salen asustados si queda modo.

**Fuera de alcance (para futuras specs):**

- Duración decreciente del susto por nivel / sistema de niveles.
- Frutas bonus y puntos por nivel.
- Alternancia scatter/chase (SPEC 01 la apartó; sigue fuera).
- Pausa "READY!", invulnerabilidad tras reset o cambios en `src/js/main.js` / `src/index.html`.
- Ajuste general de dificultad (velocidades base de SPEC 01).

## Modelo de datos

```js
// maze.js — tile nuevo
'o' → 4 (power pellet), en MAZE_STR filas 3 y 23, cols 1 y 26

// game.js — constantes nuevas (solo lectura)
const FRIGHT_FRAMES = 360;        // 6 s de modo asustado (~60 fps)
const FRIGHT_WARN_FRAMES = 120;   // 2 s finales: parpadeo azul/blanco
const FREEZE_FRAMES = 30;         // ~0.5 s congelado al comer fantasma
const FRIGHT_SPEED = 0.05;        // 1/20 — fantasma asustado
const EYES_SPEED = 0.2;           // 1/5 — ojos que regresan a la pen
const GHOST_POINTS = [ 200, 400, 800, 1600 ];
const POWER_PELLET_POINTS = 50;

// game.js — estado nuevo en game
{ ..., frightenedFrames, ghostEatChain, freezeFrames, popup }
// popup: { x, y, points } | null — vive exactamente mientras freezeFrames > 0

// game.js — el objeto ghost gana dos campos
{ x, y, dir, speed, kind, waitFrames, eaten, exempt }
// eaten:  true = es un par de ojos camino de su celda de inicio
// exempt: true = ya fue comido en este modo (no vuelve a asustarse)

// game.js — helpers nuevos
// startFright( game )     → timer a FRIGHT_FRAMES, cadena a 0, exempt a false,
//                           media vuelta de los no comidos
// chooseRandom( grid, g ) → dirección al azar entre las válidas sin reversa
//                           (180° solo en callejón, como chooseGreedy)
// ownStart( g )           → { x, y } de GHOST_STARTS según kind (destino ojos)
```

Convenciones: `frightenedFrames` decrece uno por `update` y **se pausa durante el congelado**; toda transición de velocidad de fantasma (normal ↔ asustado ↔ ojos) se aplica en el bloque "alineado" de `moveGhost`, nunca a mitad de celda.

## Plan de implementación

1. `maze.js`: parsear `'o'`→4 y sustituir los 4 dots de (1,3), (26,3), (1,23), (26,23); actualizar el comentario de tiles. `game.js`: contar 2 y 4 en `dotsRemaining` y comer tile 4 (+50) en `movePacman`. `render.js`: `drawDots` gana `frame` y pinta tile 4 como círculo mayor (r ≈ 6.5) parpadeando cada 15 frames. Prueba manual: 4 dots grandes parpadeantes; comerlos suma 50 y la partida no se gana sin ellos.
2. `game.js`: `startFright` (timer, reversa, cadena) conectado al comer pellet; reconciliar velocidad en el bloque alineado de `moveGhost` (modo activo → `FRIGHT_SPEED`, si no → `GHOST_SPEED`); `chooseRandom` en `decideGhost` cuando hay modo y el fantasma no es ojos; cuenta atrás del timer y restauración al expirar. Prueba manual: al comer pellet todos dan media vuelta, avanzan a mitad de velocidad con rutas erráticas y a los ~6 s vuelven a perseguir.
3. `render.js`: aspecto asustado en `drawGhost` (cuerpo azul `#2121de` con cara de susto) y alternancia azul/blanco cada 15 frames durante `FRIGHT_WARN_FRAMES`; la llamada en `draw` resuelve el aspecto desde `game.frightenedFrames`. Prueba manual: azul al comer pellet, parpadeo blanco de aviso, colores normales al terminar.
4. `game.js`: comer fantasma — colisión con asustado → puntos de la cadena, `eaten`, `popup` y `freezeFrames`; gate de congelado al inicio de `update` (solo decrementa `freezeFrames` y retorna); ojos: destino `ownStart` en `decideGhost`, excepción de re-entrada a la pen en `canMove`/`chooseGreedy` (solo ojos), `EYES_SPEED` reconciliado en centros, y al pisar la celda de inicio revivir (`exempt`, `waitFrames` de SPEC 03, `dir: 'up'`). Prueba manual: comer un azul congela ~0.5 s, suma 200/400/..., los ojos cruzan la puerta, reviven en su celda y salen tras su retardo.
5. `render.js`: dibujo del par de ojos sin cuerpo (reusa los ojos de `drawGhost`) y de la cifra del `popup` mientras dura el congelado. Prueba manual: durante el congelado se ve la cifra donde estaba el fantasma; después, solo ojos viajando a la pen.
6. `game.js`: limpiar el estado nuevo en `createGame` y `resetPositions` (`eaten`, `exempt`, `frightenedFrames`, `ghostEatChain`, `freezeFrames`, `popup`, velocidades). Prueba manual: morir en pleno modo deja todo en el estado de arranque. Sanity CLI de `maze.js`, `game.js` y `render.js` (`node --check src/js/<file>.js`; en WSL usar `node.exe` o `npx`) y verificación funcional completa en navegador.

## Criterios de aceptación

- [ ] Desde el arranque se ven 4 dots grandes parpadeando (~0.25 s por fase) en (1,3), (26,3), (1,23) y (26,23).
- [ ] Comer un pellet suma exactamente 50 puntos y la partida no se gana hasta comer todos los dots y los 4 pellets.
- [ ] Al comer un pellet, los fantasmas no comidos dan media vuelta, se pintan azules y avanzan a mitad de velocidad con direcciones al azar en los cruces.
- [ ] El modo dura ~6 s: en los ~2 s finales alternan azul/blanco, y al terminar cada fantasma recupera color, velocidad y personalidad de SPEC 01.
- [ ] Comer un fantasma azul congela el juego ~0.5 s mostrando la cifra en su lugar y suma 200/400/800/1600 según la cadena, que se reinicia con cada pellet.
- [ ] El fantasma comido viaja como solo-ojos (más rápido que de normal), entra a la pen por la puerta y revive al pisar su celda de inicio.
- [ ] El revivido espera su retardo de SPEC 03 (0/1/3/6 s) para salir, no se pinta azul aunque quede modo, y sí se asusta de nuevo con el siguiente pellet.
- [ ] Un par de ojos que cruza a Pac-Man no le quita vida ni se deja comer.
- [ ] Un fantasma esperando en la pen cuando se come un pellet también se pinta azul.
- [ ] Morir durante el modo limpia todo: sin azules, sin ojos, sin popup, y el escalonado de SPEC 03 se repite completo.
- [ ] La consola del navegador no muestra errores durante una partida completa.

## Decisiones

- **Sí:** ojos que caminan a la pen (greedy a su celda de inicio) y no teleport. Fiel al arcade; reutiliza `chooseGreedy`. La puerta les deja re-entrar como excepción puntual y explícita al bloqueo fuera→pen de SPEC 02.
- **Sí (refinamiento surgido en la implementación, 2026-09-22):** los ojos orientan en **dos fases**: fuera de la pen hacia una celda de entrada en la columna de la puerta (`EYES_ENTRY` = (13,14)); dentro de la pen hacia `ownStart`. El greedy directo a `ownStart` falla para blinky (inicio en col 12, a la izquierda de la puerta): el desempate left-first de `chooseGreedy` empata left/down en las celdas sobre la puerta y produce un bucle perimetral sin fin — 1479 fallos en test exhaustivo (celda caminable × dir × kind); pinky/inky/clyde convergen siempre. Con dos fases: 0 fallos. El revive no cambia: al pisar `ownStart`.
- **Sí:** 6 s de susto con 2 s de aviso (nivel 1 del arcade). Comer otro pellet reinicia el timer y la cadena de puntos.
- **Sí:** movimiento aleatorio en cruces durante el susto, como el arcade. Revive la idea del antiguo kind `random` previo a SPEC 01.
- **Sí:** velocidades 1/20 (asustado) y 1/5 (ojos). Ambas 1/N, exigencia del motor; el asustado lento es fácil de cazar y los ojos vuelven rápido, como el original.
- **Sí:** media vuelta al activarse el modo. Comportamiento del arcade; excepción documentada a la regla "nunca 180° salvo callejón" de SPEC 01/02.
- **Sí:** cadena 200/400/800/1600 con congelado de 30 frames y cifra pintada. Es el detalle icónico del original y el score ya existe en el HUD.
- **Sí:** el pellet vale 50 puntos y cuenta para ganar (244 piezas en total, como el original).
- **Sí (elección explícita del usuario, contra la recomendación):** el revivido re-aplica su retardo de salida de SPEC 03 en vez de salir inmediato. Reaprovecha el mecanismo existente tal cual; coste aceptado: hasta 6 s extra de ausencia (clyde).
- **Sí:** modo global — los esperando en la pen también se asustan. Como el arcade; además Pac-Man no puede entrar a la pen, así que no son comestibles en la práctica.
- **Sí:** `exempt` — un fantasma comido no vuelve a ser comestible dentro del mismo modo (los revividos del arcade salen con su color normal). Se limpia con el siguiente pellet.
- **Sí:** ojos inofensivos y muerte que limpia todo el estado nuevo. Comportamiento del arcade; evita estados zombis tras un reset.
- **Sí:** las velocidades de fantasma se reconcilian solo en centros alineados. Cambiar a 1/5 o 1/10 a mitad de celda desde un múltiplo impar de 1/20 haría que el fantasma nunca volviera a alinear (ver Riesgos).
- **No:** teleport a la pen. Salto brusco y desaprovecha `chooseGreedy`.
- **No:** huir de Pac-Man en vez de aleatorio. Más "listo" que el arcade y menos fiel.
- **No:** duración por nivel o frutas. No hay sistema de niveles; merece su propia spec si aterriza.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Cambio de velocidad a mitad de celda desde un múltiplo impar de 1/20 (p. ej. 1.05): con 1/5 o 1/10 jamás vuelve a un centro → el fantasma atraviesa muros sin decidir | Toda transición de velocidad se aplica en el bloque "alineado" de `moveGhost` (los centros son enteros); la reversa de `startFright` solo invierte `dir` y la velocidad se reconcilia en el próximo centro. |
| Los ojos no llegan a su celda (el greedy con re-entrada da vueltas) | Se confirmó en la implementación: bucle perimetral de blinky por el desempate left-first de `chooseGreedy`. Resuelto con destino en dos fases (`EYES_ENTRY` → `ownStart`); verificado con test exhaustivo celda×dir×kind (0 fallos) y criterio de aceptación en navegador. |
| El congelado introduce una pausa inédita en el bucle | Gate único al inicio de `update`: con `freezeFrames > 0` solo decrementa contadores y retorna; nada más de `update` se toca. |
| Timer por frame: en monitores de 120 Hz el susto se acorta a ~3 s | Limitación preexistente del motor, ya documentada en SPEC 03; misma decisión. |

## Lo que **no** está en esta spec

- Sistemas de nivel, frutas bonus, scatter/chase, "READY!", invulnerabilidad y cambios en `main.js`/`index.html`.

Cada una de ellas, si aterriza, va en su propia spec.
