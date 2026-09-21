# SPEC 02 — Salida de los fantasmas de la pen

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-21
> **Objetivo:** Garantizar que los fantasmas salgan de la pen caminando por la puerta nada más empezar a moverse (arranque y resets por colisión) y que no puedan re-entrar una vez fuera.

## Por qué existe esta spec

SPEC 01 asumió "salida libre por la puerta, sin timers". En la práctica la puerta (tile 3) no bloquea a los fantasmas: lo que los atrapa es `decideGhost` (`src/js/game.js`). Dentro de la jaula, el greedy de persecución y el random deambulan por el interior (filas 13-15, cols 11-16) sin comprometerse con la columna de la puerta, y el giro de 180° está vetado salvo callejón, así que nunca encuentran la salida.

## Alcance

**Dentro:**

- Modo salida en `decideGhost` (`src/js/game.js`): mientras el fantasma esté en el área de la pen, su destino de greedy es la celda transitable sobre la puerta (fila 11) en la columna de puerta más cercana, en lugar de su personalidad.
- Puerta unidireccional en `canMove` (`src/js/game.js`): un fantasma que está fuera no puede moverse a ninguna celda de la pen; pen→fuera y pen→pen siguen permitidos.
- Constantes de geometría en `src/js/maze.js`: `PEN_AREA`, `PEN_DOOR_COLS`, `PEN_EXIT_ROW`, exportadas como globals de `window`.
- Aplica al arranque de la partida y a cada `resetPositions` por colisión (sin cambios en `resetPositions`).

**Fuera de alcance (para futuras specs):**

- Salida escalonada con timers (ya descartada en SPEC 01).
- Modo asustado, power pellets y regreso a la pen al ser comidos.
- Cambios en `GHOST_STARTS` (posiciones y kinds: eso es SPEC 01).
- Velocidad distinta dentro de la pen.
- Animación de espera (rebote vertical) dentro de la pen.
- Cambios en `src/js/render.js` o `src/js/main.js`.

## Modelo de datos

```js
// maze.js — nuevas constantes de geometría (solo lectura)
const PEN_AREA = { x0: 11, x1: 16, y0: 12, y1: 15 }; // jaula: interior filas 13-15 + puerta fila 12
const PEN_DOOR_COLS = [ 13, 14 ]; // columnas de la puerta (fila 12)
const PEN_EXIT_ROW = 11;          // fila transitable justo sobre la puerta

// game.js — helpers nuevos, sin estado en el objeto ghost
// isPenCell( x, y )  → true si (x,y) cae dentro de PEN_AREA
// penExitTarget( g ) → { x: columna de PEN_DOOR_COLS más cercana a g.x, y: PEN_EXIT_ROW }
```

El objeto `ghost` no cambia (`x`, `y`, `dir`, `speed`, `kind`); la condición de "estoy en la pen" se deriva de la posición.

## Plan de implementación

1. `maze.js`: añadir `PEN_AREA`, `PEN_DOOR_COLS`, `PEN_EXIT_ROW` y exportarlas por `window.*`. Prueba manual: el juego carga igual (constantes aún sin uso), consola limpia.
2. `game.js`: añadir `isPenCell( x, y )` y `penExitTarget( g )`. Prueba manual: sin cambios visibles (helpers sin conectar).
3. `game.js`: en `canMove`, para `actor === 'ghost'`, bloquear el movimiento hacia una celda de la pen cuando la celda actual no es de la pen. Prueba manual: partida sin regresiones (los fantasmas siguen deambulando dentro; todavía no salen).
4. `game.js`: en `decideGhost`, si `isPenCell( g.x, g.y )`, elegir dirección con el greedy existente (`chooseGreedy` de SPEC 01) hacia `penExitTarget( g )` y retornar antes de resolver la personalidad. Prueba manual: los 4 fantasmas salen caminando por la puerta al arrancar y tras cada colisión.
5. Sanity CLI de `maze.js` y `game.js` (`node --check src/js/<file>.js`; en WSL usar `node.exe` o `npx`) y verificación funcional completa en navegador.

## Criterios de aceptación

- [ ] Al arrancar la partida, los 4 fantasmas salen de la pen caminando por la puerta y quedan fuera del área de la jaula (filas 12-15, cols 11-16) en menos de 3 segundos.
- [ ] blinky y pinky (columnas de inicio 12-13) salen por la columna 13; inky y clyde (14-15) por la columna 14.
- [ ] Ningún fantasma queda atrapado en la pen tras el arranque ni tras un reset por colisión.
- [ ] Tras una colisión, los fantasmas reaparecen en la pen (criterio de SPEC 01) y vuelven a salir por la puerta.
- [ ] Ningún fantasma ya fuera re-entra en la pen durante una partida (ninguno cruza la puerta hacia abajo).
- [ ] Fuera de la pen, cada fantasma conserva su personalidad de SPEC 01 (persecución, emboscada, flanqueo, timidez).
- [ ] Ningún fantasma da giro de 180° salvo en callejón sin salida (regla existente conservada, también dentro de la pen).
- [ ] Pac-Man sigue sin poder entrar en la pen (la puerta lo bloquea igual que antes).
- [ ] La consola del navegador no muestra errores durante una partida completa.

## Decisiones

- **Sí:** camino guiado, no teleport. Mientras estén en la pen, destino de greedy = celda sobre la puerta; reutiliza `chooseGreedy` de SPEC 01 y se ve natural.
- **Sí:** salida inmediata y simultánea, sin timers. Coherente con SPEC 01 ("salida libre por la puerta, sin timers").
- **Sí:** detección posicional (`isPenCell`) y no campo `g.inPen`. Nada que sincronizar en `createGame` ni `resetPositions`; la posición es fuente única de verdad.
- **Sí:** puerta unidireccional a nivel de movimiento (`canMove`). pen→fuera permitido, fuera→pen bloqueado; evita que la persecución meta a un fantasma de vuelta a la jaula.
- **Sí:** columna de salida más cercana (13 o 14) según la columna del fantasma. Recorridos más cortos y salida repartida entre las dos celdas de la puerta.
- **Sí:** constantes de geometría en `maze.js`, junto a `TUNNEL_ROW`. Convención existente: la geometría del laberinto vive en `maze.js`.
- **No:** teleport al primer tick. Salto visual brusco; el camino guiado cuesta lo mismo en complejidad.
- **No:** empezar fuera de la pen (`GHOST_STARTS` en el mapa). Contradice a SPEC 01 aprobado (inicios y resets dentro de la pen).
- **No:** timers escalonados por fantasma. SPEC 01 los descartó explícitamente como mecánica futura.
- **No:** animación de rebote dentro de la pen. Sin escalonado no hay espera que animar.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `PEN_AREA` desincronizada si se edita `MAZE_STR` | Las constantes viven en `maze.js` junto al laberinto, documentadas con filas y columnas literales. |
| Empates del greedy (orden de `DIRS`, `left` primero) pueden desviar la ruta de salida | Trazas verificadas a mano desde las 4 columnas de inicio: todas salen por su columna más cercana; se re-verifica en navegador (criterio 2). |
| Dos fantasmas coinciden en la misma celda de la puerta | No existe colisión fantasma-fantasma en el motor; se superponen sin efecto. |
| Implementar esta spec antes que SPEC 01 | El paso 4 usa `chooseGreedy`/`ghostTarget` introducidos por SPEC 01; con el código actual (hunter/random) habría que adaptarlo. Por eso la dependencia. |

## Lo que **no** está en esta spec

- Timers de salida escalonada, modo asustado/comestibles y regreso a la pen al ser comido, cambios en `GHOST_STARTS`, velocidad distinta dentro de la pen y animación de espera.

Cada una de ellas, si aterriza, va en su propia spec.
