# SPEC 01 — Cuatro fantasmas con personalidad clásica

> **Estado:** Implementado
> **Depende de:** Ninguno
> **Fecha:** 2026-09-21
> **Objetivo:** Sustituir los dos fantasmas genéricos actuales por los cuatro fantasmas clásicos del arcade, cada uno con conducta propia, siendo Blinky el perseguidor agresivo de Pac-Man.

## Alcance

**Dentro:**

- Cuatro fantasmas desde el inicio de cada partida, con `kind` en `GHOST_STARTS` (`src/js/maze.js`): `blinky`, `pinky`, `inky`, `clyde`.
- Personalidades clásicas (objetivo de orientación para la elección greedy en cada cruce):
  - **blinky** (rojo): objetivo = celda de Pac-Man. Persecución directa agresiva; evoluciona del `hunter` actual.
  - **pinky** (rosa): objetivo = 4 celdas delante de Pac-Man según `p.dir`. Emboscada.
  - **inky** (cian): objetivo = punto reflejado: 2 celdas delante de Pac-Man, duplicando el vector desde blinky. Flanqueo.
  - **clyde** (naranja): objetivo = Pac-Man si su distancia Manhattan es ≥ 8; su esquina `(0, 30)` si es < 8. Tímido.
- Posiciones de inicio: los cuatro dentro de la pen, fila 14, columnas 12–15 (simétricas respecto al eje 13/14). Salida libre por la puerta, sin timers.
- Color por `kind` en `src/js/render.js` (mapa kind→color en lugar del array por índice actual).

**Fuera de alcance (para futuras specs):**

- Alternancia scatter/chase (fases globales temporizadas).
- Modo asustado, power pellets y fantasmas comestibles.
- Velocidades distintas por fantasma.
- Salida escalonada de la pen con timers.
- Nombres pintados en pantalla.

## Modelo de datos

```js
// maze.js — GHOST_STARTS pasa de 2 a 4 entradas (desaparecen 'hunter' y 'random')
const GHOST_STARTS = [
  { x: 12, y: 14, kind: 'blinky' },
  { x: 13, y: 14, kind: 'pinky' },
  { x: 14, y: 14, kind: 'inky' },
  { x: 15, y: 14, kind: 'clyde' },
];

// game.js — constantes nuevas (solo lectura)
const AMBUSH_AHEAD = 4;                   // celdas delante para pinky
const FLANK_AHEAD = 2;                    // celdas delante para el vector de inky
const CLYDE_RANGE = 8;                    // distancia Manhattan que activa la timidez
const CLYDE_CORNER = { x: 0, y: 30 };     // esquina inferior-izquierda (destino de
                                          // orientación; no necesita ser transitable)

// render.js — color por kind (antes: array por índice)
const GHOST_COLORS = {
  blinky: '#ff0000',
  pinky: '#ffb8ff',
  inky: '#00ffff',
  clyde: '#ffb852',
};
```

El objeto `ghost` no cambia (`x`, `y`, `dir`, `speed`, `kind`); la personalidad se resuelve en `decideGhost` a partir del `kind`.

## Plan de implementación

1. `maze.js`: sustituir `GHOST_STARTS` por las 4 entradas. Prueba manual: en el navegador se ven 4 fantasmas (los kinds nuevos caen en la rama `else` aleatoria hasta el paso 3; el juego sigue jugable).
2. `game.js`: extraer del `hunter` actual la elección greedy (dirección que minimiza distancia Manhattan a un destino) a un helper `chooseGreedy( grid, g, target )`; blinky usa destino = celda de Pac-Man. Prueba manual: el rojo persigue como hoy, sin errores en consola.
3. `game.js`: añadir `ghostTarget( game, g )` que devuelve el destino por `kind` (pinky, inky con blinky buscado por `kind`, clyde con su umbral) y conectar `decideGhost` para que los cuatro pasen por el greedy. Se conserva el 180° solo en callejón. Prueba manual: pinky corta el paso, clyde se retira al acercarse.
4. `render.js`: mapa `GHOST_COLORS` por kind y actualizar la llamada en `draw`. Prueba manual: colores rojo, rosa, cian y naranja según personalidad.
5. Sanity CLI de los tres archivos (`node --check src/js/<file>.js`; en WSL usar `node.exe` o `npx`) y verificación funcional completa en navegador.

## Criterios de aceptación

- [ ] Al iniciar una partida se ven 4 fantasmas dentro de la pen con colores rojo, rosa, cian y naranja.
- [ ] La consola del navegador no muestra errores durante una partida.
- [ ] El fantasma rojo (blinky) reduce su distancia Manhattan a Pac-Man de forma sostenida en pasillos despejados.
- [ ] Con Pac-Man avanzando en una dirección, el rosa (pinky) gira hacia cruces por delante de él, no hacia su posición actual.
- [ ] El cian (inky) ataca desde un costado distinto al del rojo: su rumbo en los cruces cambia si blinky cambia de posición.
- [ ] El naranja (clyde) se aleja de Pac-Man cuando está a menos de 8 casillas y vuelve a perseguir al alejarse.
- [ ] Ningún fantasma da giro de 180° salvo en callejón sin salida (comportamiento existente conservado).
- [ ] Tras una colisión, los 4 fantasmas reaparecen en sus posiciones de inicio dentro de la pen.

## Decisiones

- **Sí:** personalidades clásicas arcade. Cubren el requisito de "uno agresivo" (blinky) y cada una se percibe distinta.
- **Sí:** kinds con los nombres clásicos en minúscula. Vocabulario estándar de un clon de Pac-Man; mapean 1:1 con color y conducta.
- **Sí:** color por `kind` y no por índice. Desacopla el orden de `GHOST_STARTS` de los colores; con el orden clásico, rosa y cian quedaban cruzados en el array actual.
- **Sí:** los cuatro en la pen con salida libre y misma velocidad (0.1). El motor exige velocidades 1/N para alinear giros y decisiones.
- **Sí:** objetivos de pinky/inky calculados sobre `p.dir` redondeado, sin replicar el bug "up-left" del arcade original.
- **No:** scatter/chase y modo asustado. Decisión de la fase de preguntas: cada mecánica merece su propia spec.
- **No:** salida escalonada con timers. Estado extra sin beneficio para el objetivo de esta spec.
- **No:** velocidades diferenciadas. Riesgo técnico documentado: rompen la alineación en centros de celda.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Destinos de pinky/inky fuera del laberinto (p.ej. 4 delante en el túnel) | El destino solo orienta la elección greedy entre direcciones válidas; nunca se viaja a él ni se indexa la parrilla con él. |
| inky depende de blinky (existencia y búsqueda) | blinky siempre existe (`GHOST_STARTS` fijo); se busca por `kind === 'blinky'`, no por índice. |
| Cuatro fantasmas suben la dificultad (colisiones más frecuentes) | El comportamiento actual (reset sin pausa ni invulnerabilidad) se conserva; ajustar dificultad queda fuera de esta spec. |

## Lo que **no** está en esta spec

- Scatter/chase, modo asustado/power pellets, velocidades diferenciadas, salida escalonada de la pen y nombres en pantalla.

Cada una de ellas, si aterriza, va en su propia spec.
