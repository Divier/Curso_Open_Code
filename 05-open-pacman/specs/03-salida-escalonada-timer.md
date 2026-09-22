# SPEC 03 — Salida escalonada de la pen con timers

> **Estado:** Implementado
> **Depende de:** SPEC 02
> **Fecha:** 2026-09-22
> **Objetivo:** Escalonar la salida de la pen con retardos fijos por fantasma —blinky inmediato, pinky ~1 s, inky ~3 s, clyde ~6 s, medidos en frames— aplicados al arrancar y tras cada colisión, con rebote visual durante la espera.

## Alcance

**Dentro:**

- Retardos de salida por fantasma en `src/js/game.js`: constante `GHOST_RELEASE_FRAMES` por `kind` (blinky 0, pinky 60, inky 180, clyde 360 frames ≈ 0/1/3/6 s a ~60 fps).
- Campo `waitFrames` en el objeto ghost (cuenta atrás en frames), asignado en `createGame` y re-asignado en `resetPositions`.
- Gate de espera al inicio de `moveGhost` (`src/js/game.js`): mientras `waitFrames > 0` el fantasma ni decide ni se mueve; al llegar a 0 retoma el flujo de salida de SPEC 02 sin cambios en `decideGhost`.
- Rebote visual en `src/js/render.js`: mientras `waitFrames > 0`, `drawGhost` suma un desplazamiento vertical senoidal (±3 px) usando el `frame` que `draw` ya recibe.

**Fuera de alcance (para futuras specs):**

- Contadores de dots del arcade como disparador alternativo.
- Segunda tabla de tiempos más cortos tras reset.
- blinky empezando fuera de la pen (SPEC 01 lo cerró: los cuatro nacen y resetean dentro).
- Rebote posicional (oscilar la coordenada `y` del juego).
- Pausa "READY!" o congelamiento al arrancar/resetear.
- Bucle a tasa fija o delta-time (limitación preexistente del motor).

## Modelo de datos

```js
// game.js — retardos de salida por kind, en frames (~60 fps)
const GHOST_RELEASE_FRAMES = {
  blinky: 0,    // sale de inmediato
  pinky: 60,    // ~1 s
  inky: 180,    // ~3 s
  clyde: 360,   // ~6 s
};

// game.js — el objeto ghost gana un campo
{ x, y, dir, speed, kind, waitFrames } // waitFrames: cuenta atras, 0 = liberado
```

Convenciones: la cuenta atrás decrece una unidad por `update`; solo se re-asigna (valor completo) en `createGame` y `resetPositions`.

## Plan de implementación

1. `game.js`: añadir `GHOST_RELEASE_FRAMES` e inicializar `waitFrames` por `kind` en el mapeo de ghosts de `createGame`. Prueba manual: el juego carga igual (campo aún sin uso), consola limpia.
2. `game.js`: gate al inicio de `moveGhost` — si `waitFrames > 0`, decrementar y retornar. Prueba manual: blinky sale al instante; pinky, inky y clyde quedan quietos en sus celdas.
3. `game.js`: en `resetPositions`, re-asignar `waitFrames` por `kind` junto a posición y `dir`. Prueba manual: tras una colisión el escalonado se repite idéntico (0/1/3/6 s).
4. `render.js`: pasar `frame` a `drawGhost` y aplicar el bob vertical (p. ej. `Math.sin( frame * 0.15 ) * 3`) solo cuando `waitFrames > 0`. Prueba manual: los que esperan rebotan visualmente, blinky nunca, y el bob cesa al liberarse.
5. Sanity CLI de `game.js` y `render.js` (`node --check src/js/<file>.js`; en WSL usar `node.exe` o `npx`) y verificación funcional completa en navegador.

## Criterios de aceptación

- [ ] Al arrancar, blinky sale de la pen de inmediato y pinky, inky y clyde permanecen en sus celdas de inicio ~1 s, ~3 s y ~6 s (±0.5 s) antes de salir.
- [ ] La salida sigue el orden blinky → pinky → inky → clyde y cada uno camina por la puerta según SPEC 02 (columna más cercana, fila `PEN_EXIT_ROW`).
- [ ] Mientras `waitFrames > 0`, un fantasma no cambia ni `x`/`y` ni `dir`.
- [ ] Tras una colisión, los 4 reaparecen en la pen y el escalonado se repite con exactamente los mismos tiempos.
- [ ] Los fantasmas en espera muestran rebote vertical visual; el rebote desaparece al liberarse; blinky no rebota nunca.
- [ ] Fuera de la pen, las personalidades de SPEC 01 se conservan intactas.
- [ ] Ningún fantasma ya fuera re-entra a la pen (SPEC 02 conservado).
- [ ] La consola del navegador no muestra errores durante una partida completa.

## Decisiones

- **Sí:** cuenta atrás por fantasma (`waitFrames`) y no reloj global (`game.tick` + `releaseAt` absolutos). El reset re-aplica retardos sin aritmética de "tick actual + retardo"; el estado vive en el propio ghost.
- **Sí:** retardos por `kind` y no por índice. Misma convención y razón que `GHOST_COLORS` en SPEC 01: desacopla del orden de `GHOST_STARTS`.
- **Sí:** tiempos clásicos aproximados en frames (0/60/180/360 ≈ 0/1/3/6 s). Aproximación suficiente al ritmo arcade sin contadores de dots.
- **Sí:** gate en `moveGhost` antes de decidir/mover. `decideGhost` y el modo salida de SPEC 02 quedan intactos; al liberarse, el fantasma retoma ese flujo tal cual.
- **Sí:** rebote puramente visual en `render.js` con el `frame` que `draw` ya recibe. Las coordenadas de juego quedan alineadas en la celda de inicio; cero riesgo para la lógica de alineación (SPEC 02 dejó el rebote pendiente a propósito).
- **Sí:** detección de espera en render por `g.waitFrames > 0`, sin exportar `isPenCell`. `waitFrames > 0` solo puede darse dentro de la pen: se asigna en `createGame`/`resetPositions` y de ahí solo decrece hasta 0.
- **No:** contadores de dots como disparador alternativo. Más estado y condiciones; el timer fijo cubre el objetivo (decisión de la fase de preguntas).
- **No:** timers más cortos tras reset. Segunda tabla sin beneficio claro; la uniformidad es más simple y regala respiro al jugador tras perder vida.
- **No:** blinky naciendo fuera de la pen. Contradice SPEC 01 (inicios y resets de los cuatro dentro); decisión cerrada que no se reabre.
- **No:** delta-time/segundos reales. El motor es por frame (velocidades 1/N); introducir dt solo para el timer sería incoherente.
- **No:** rebote posicional (oscilar `y` en `game.js`). Riesgo gratuito con el modelo fraccional; el bob visual se ve igual.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| En monitores de alta frecuencia (p. ej. 120 Hz) el escalonado se acorta a la mitad (~0.5/1.5/3 s) | Limitación preexistente del motor: velocidades y animaciones ya van por frame con rAF. Fuera de alcance; documentada aquí. |
| Colisión con blinky/pinky mientras inky/clyde aún esperan | `resetPositions` re-asigna los retardos completos: la cuenta atrás de los que esperaban vuelve a empezar desde su valor total. Comportamiento aceptado en la decisión de "mismos timers". |
| El bob visual saca al sprite de su celda | Amplitud ±3 px con `TILE` 20 y radio 9: el sprite sigue dentro de la celda y de la jaula. |

## Lo que **no** está en esta spec

- Contadores de dots, timers cortos tras reset, blinky fuera de la pen, rebote posicional, pausa "READY!" y fixed timestep/delta-time.

Cada una de ellas, si aterriza, va en su propia spec.
