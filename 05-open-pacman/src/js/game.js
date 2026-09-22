// game.js
// Estado y reglas. Depende de globals de maze.js: MAZE, TUNNEL_ROW,
// PACMAN_START, GHOST_STARTS, PEN_AREA, PEN_DOOR_COLS, PEN_EXIT_ROW.

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };

const PACMAN_SPEED = 0.125; // 1/8 celda/frame -> alinea cada 8 frames
const GHOST_SPEED = 0.1;    // 1/10 celda/frame

// Power pellets (SPEC 04): puntos al comerlos; cuentan para ganar (dotsRemaining).
const POWER_PELLET_POINTS = 50;

// Personalidades clasicas: constantes de los destinos de orientacion.
const AMBUSH_AHEAD = 4;                // celdas delante de Pac-Man para pinky
const FLANK_AHEAD = 2;                 // celdas delante para el vector de inky
const CLYDE_RANGE = 8;                 // distancia Manhattan que activa la timidez
const CLYDE_CORNER = { x: 0, y: 30 };  // esquina inferior-izquierda de clyde

// Salida escalonada de la pen (SPEC 03): retardo por kind, en frames (~60 fps).
const GHOST_RELEASE_FRAMES = {
  blinky: 0,    // sale de inmediato
  pinky: 60,    // ~1 s
  inky: 180,    // ~3 s
  clyde: 360,   // ~6 s
};

// Modo asustado (SPEC 04): duracion, aviso final y velocidad de fantasma.
// Velocidad 1/N para que el actor vuelva a alinear en centros (exigencia
// del motor); FRIGHT_WARN_FRAMES lo consume render.js (parpadeo de aviso).
const FRIGHT_FRAMES = 360;       // 6 s de modo asustado (~60 fps)
const FRIGHT_WARN_FRAMES = 120;  // 2 s finales: parpadeo azul/blanco
const FRIGHT_SPEED = 0.05;       // 1/20 — fantasma asustado
const EYES_SPEED = 0.2;          // 1/5 — ojos que regresan a la pen
const FREEZE_FRAMES = 30;        // ~0.5 s congelado al comer fantasma
const GHOST_POINTS = [ 200, 400, 800, 1600 ]; // cadena; reinicia con cada pellet

// Celda de entrada de los ojos (SPEC 04): interior de la pen en la columna de
// la puerta. Los ojos orientan a ella mientras estan fuera — el greedy directo
// a ownStart empata left/down sobre la puerta y buclea (ver Decisiones de la
// spec); dentro de la pen ya orientan a su celda de inicio.
const EYES_ENTRY = { x: PEN_DOOR_COLS[ 0 ], y: 14 };

// Crea una partida nueva. Copia MAZE (pristino) a game.grid para poder comer
// dots sin destruir el original, y reiniciar.
function createGame() {
  const grid = MAZE.map( ( row ) => row.slice() );
  // La celda de inicio de Pacman arranca sin dot.
  grid[ PACMAN_START.y ][ PACMAN_START.x ] = 0;

  // Dots y power pellets (tiles 2 y 4) pendientes: comer todo para ganar (SPEC 04).
  let dots = 0;
  for ( const row of grid ) for ( const v of row ) if ( v === 2 || v === 4 ) dots++;

  return {
    state: 'start',
    score: 0,
    lives: 3,
    dotsRemaining: dots,
    grid,
    frightenedFrames: 0, // modo asustado activo mientras > 0 (SPEC 04)
    ghostEatChain: 0,    // cadena 200/400/800/1600, reinicia con cada pellet
    freezeFrames: 0,     // congelado tras comer fantasma (SPEC 04)
    popup: null,         // { x, y, points } mientras freezeFrames > 0 (SPEC 04)
    pacman: {
      x: PACMAN_START.x,
      y: PACMAN_START.y,
      dir: 'left',
      nextDir: null,
      speed: PACMAN_SPEED,
    },
    ghosts: GHOST_STARTS.map( ( g ) => ( {
      x: g.x,
      y: g.y,
      dir: 'up',
      speed: GHOST_SPEED,
      kind: g.kind,
      waitFrames: GHOST_RELEASE_FRAMES[ g.kind ],
      eaten: false,  // true = par de ojos camino de su celda de inicio (SPEC 04)
      exempt: false, // true = ya fue comido en este modo: no vuelve a asustarse
    } ) ),
  };
}

function aligned( v ) {
  return Math.abs( v - Math.round( v ) ) < 1e-3;
}

// Una celda es muro para el actor dado?
//   pacman: bloqueado por pared (1) y puerta (3)
//   ghost / eyes: bloqueado solo por pared (1)
function isWall( grid, x, y, actor ) {
  if ( y < 0 || y >= grid.length ) return true;
  if ( x < 0 || x >= grid[ 0 ].length ) return true;
  const v = grid[ y ][ x ];
  if ( v === 1 ) return true;
  if ( v === 3 && actor === 'pacman' ) return true;
  return false;
}

// Puede el actor avanzar desde (x,y) en la direccion dir?
function canMove( grid, x, y, dir, actor ) {
  const d = DIRS[ dir ];
  if ( !d ) return false;
  const tx = x + d.x;
  const ty = y + d.y;
  // Tunel: salir por un borde en la fila del tunel siempre es valido.
  if ( ty === TUNNEL_ROW && ( tx < 0 || tx >= grid[ 0 ].length ) ) return true;
  // Puerta unidireccional (SPEC 02): un fantasma fuera de la pen no puede
  // moverse a una celda de la pen; pen->fuera y pen->pen siguen permitidos.
  // Excepcion (SPEC 04): los ojos (fantasma comido) SI re-entran a la pen.
  if ( actor === 'ghost' && isPenCell( tx, ty ) && !isPenCell( x, y ) ) return false;
  return !isWall( grid, tx, ty, actor );
}

function wrapTunnel( a, width ) {
  if ( Math.round( a.y ) === TUNNEL_ROW ) {
    if ( a.x < 0 ) a.x += width;
    else if ( a.x >= width ) a.x -= width;
  }
}

function movePacman( game ) {
  const p = game.pacman;
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( p.x ) && aligned( p.y ) ) {
    p.x = Math.round( p.x );
    p.y = Math.round( p.y );

    // Aplicar giro pendiente si es posible.
    if ( p.nextDir && canMove( grid, p.x, p.y, p.nextDir, 'pacman' ) ) {
      p.dir = p.nextDir;
      p.nextDir = null;
    }
    // Comer dot (10 pts) o power pellet (tile 4, 50 pts — SPEC 04).
    const tile = grid[ p.y ][ p.x ];
    if ( tile === 2 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += 10;
      game.dotsRemaining--;
    } else if ( tile === 4 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += POWER_PELLET_POINTS;
      game.dotsRemaining--;
      startFright( game );
    }
    // Si no puede seguir, se detiene en la celda.
    if ( !canMove( grid, p.x, p.y, p.dir, 'pacman' ) ) return;
  }

  const d = DIRS[ p.dir ];
  p.x += d.x * p.speed;
  p.y += d.y * p.speed;
  wrapTunnel( p, width );
}

// Eleccion greedy: de las direcciones validas desde la celda del fantasma
// (sin invertir la actual, salvo callejon) devuelve la que minimiza la
// distancia Manhattan al destino. El destino solo orienta; nunca se viaja a el.
function chooseGreedy( grid, g, target ) {
  // Los ojos (SPEC 04) usan actor 'eyes': pueden re-entrar a la pen.
  const actor = g.eaten ? 'eyes' : 'ghost';
  const options = Object.keys( DIRS ).filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir, actor )
  );
  // Sin salida (callejon): permitir el giro de 180.
  const choices = options.length ? options : [ '' + OPPOSITE[ g.dir ] ];

  let best = choices[ 0 ];
  let bestDist = Infinity;
  for ( const dir of choices ) {
    const d = DIRS[ dir ];
    const nx = g.x + d.x;
    const ny = g.y + d.y;
    const dist = Math.abs( nx - target.x ) + Math.abs( ny - target.y );
    if ( dist < bestDist ) {
      bestDist = dist;
      best = dir;
    }
  }
  return best;
}

// Eleccion aleatoria (SPEC 04): de las direcciones validas desde la celda del
// fantasma (sin invertir la actual, salvo callejon — igual que chooseGreedy)
// devuelve una al azar. La usan los fantasmas asustados en los cruces.
function chooseRandom( grid, g ) {
  const options = Object.keys( DIRS ).filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir, 'ghost' )
  );
  // Sin salida (callejon): permitir el giro de 180.
  const choices = options.length ? options : [ '' + OPPOSITE[ g.dir ] ];
  return choices[ Math.floor( Math.random() * choices.length ) ];
}

// Destino de orientacion por personalidad. Puede caer fuera del laberinto
// (tuneles, esquinas): solo orienta la eleccion greedy; nunca se viaja a el
// ni se indexa la parrilla con el.
function ghostTarget( game, g ) {
  const p = game.pacman;
  const px = Math.round( p.x );
  const py = Math.round( p.y );

  if ( g.kind === 'blinky' ) {
    // Persecucion directa agresiva: la celda de Pac-Man.
    return { x: px, y: py };
  }
  if ( g.kind === 'pinky' ) {
    // Emboscada: AMBUSH_AHEAD celdas delante de Pac-Man segun su dir.
    const d = DIRS[ p.dir ];
    return { x: px + d.x * AMBUSH_AHEAD, y: py + d.y * AMBUSH_AHEAD };
  }
  if ( g.kind === 'inky' ) {
    // Flanqueo: FLANK_AHEAD celdas delante de Pac-Man, duplicando el vector
    // desde blinky (buscado por kind, no por indice).
    const d = DIRS[ p.dir ];
    const ax = px + d.x * FLANK_AHEAD;
    const ay = py + d.y * FLANK_AHEAD;
    const blinky = game.ghosts.find( ( o ) => o.kind === 'blinky' );
    return { x: 2 * ax - Math.round( blinky.x ), y: 2 * ay - Math.round( blinky.y ) };
  }
  // clyde: timido — persigue de lejos, se retira a su esquina si Pac-Man
  // queda a menos de CLYDE_RANGE casillas (Manhattan).
  const dist = Math.abs( g.x - px ) + Math.abs( g.y - py );
  return dist < CLYDE_RANGE ? CLYDE_CORNER : { x: px, y: py };
}

// Cae la celda (x,y) dentro de la pen (interior mas puerta)? Geometria de
// maze.js: PEN_AREA.
function isPenCell( x, y ) {
  return x >= PEN_AREA.x0 && x <= PEN_AREA.x1 && y >= PEN_AREA.y0 && y <= PEN_AREA.y1;
}

// Destino de salida de la pen: fila sobre la puerta (PEN_EXIT_ROW), en la
// columna de puerta (PEN_DOOR_COLS) mas cercana a la posicion del fantasma.
function penExitTarget( g ) {
  const x = Math.round( g.x );
  let best = PEN_DOOR_COLS[ 0 ];
  for ( const col of PEN_DOOR_COLS ) {
    if ( Math.abs( col - x ) < Math.abs( best - x ) ) best = col;
  }
  return { x: best, y: PEN_EXIT_ROW };
}

// Celda de inicio propia segun kind (SPEC 04): destino de los ojos. Los
// kinds son unicos en GHOST_STARTS, asi que el find siempre resuelve.
function ownStart( g ) {
  const s = GHOST_STARTS.find( ( o ) => o.kind === g.kind );
  return { x: s.x, y: s.y };
}

// Activa el modo asustado (SPEC 04): timer a FRIGHT_FRAMES, cadena de puntos
// a 0, exempt a false y media vuelta de todos los fantasmas no comidos
// (excepcion documentada a la regla del 180 de SPEC 01/02). Solo invierte
// dir: la velocidad (1/20) se reconcilia en el proximo centro alineado.
function startFright( game ) {
  game.frightenedFrames = FRIGHT_FRAMES;
  game.ghostEatChain = 0;
  game.ghosts.forEach( ( g ) => {
    g.exempt = false;
    if ( !g.eaten ) g.dir = OPPOSITE[ g.dir ];
  } );
}

function decideGhost( game, g ) {
  // Ojos (SPEC 04), en dos fases (ver Decisiones de la spec): fuera de la pen
  // orientan a EYES_ENTRY (entrada por la columna de la puerta); dentro ya
  // orientan a su celda de inicio. Antes del modo pen (SPEC 02), o la salida
  // de la pen desviaria a los ojos que ya entran.
  if ( g.eaten ) {
    const target = isPenCell( g.x, g.y ) ? ownStart( g ) : EYES_ENTRY;
    g.dir = chooseGreedy( game.grid, g, target );
    return;
  }
  // Modo salida (SPEC 02): dentro de la pen el destino de orientacion es la
  // celda sobre la puerta; la personalidad se retoma al pisar el mapa.
  if ( isPenCell( g.x, g.y ) ) {
    g.dir = chooseGreedy( game.grid, g, penExitTarget( g ) );
    return;
  }
  // Modo asustado (SPEC 04): direccion al azar en los cruces. Los exempt
  // (ya comidos en este modo) siguen con su personalidad y velocidad normales.
  if ( game.frightenedFrames > 0 && !g.exempt ) {
    g.dir = chooseRandom( game.grid, g );
    return;
  }
  // Las cuatro personalidades resuelven un destino y eligen greedy hacia el.
  g.dir = chooseGreedy( game.grid, g, ghostTarget( game, g ) );
}

function moveGhost( game, g ) {
  // Gate de espera (SPEC 03): con cuenta atras pendiente el fantasma ni
  // decide ni se mueve; al llegar a 0 retoma el flujo de salida de SPEC 02.
  if ( g.waitFrames > 0 ) {
    g.waitFrames--;
    return;
  }

  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( g.x ) && aligned( g.y ) ) {
    g.x = Math.round( g.x );
    g.y = Math.round( g.y );
    // Ojos (SPEC 04) que pisaron su celda de inicio: reviven con su retardo
    // de salida (SPEC 03), quedan exempt el resto del modo y miran arriba.
    if ( g.eaten ) {
      const start = ownStart( g );
      if ( g.x === start.x && g.y === start.y ) {
        g.eaten = false;
        g.exempt = true;
        g.waitFrames = GHOST_RELEASE_FRAMES[ g.kind ];
        g.dir = 'up';
        return;
      }
    }
    // Reconciliar velocidad SOLO en centro alineado (SPEC 04): cambiarla a
    // mitad de celda desde un multiplo impar de 1/20 jamas volveria a alinear.
    if ( g.eaten ) g.speed = EYES_SPEED;
    else if ( game.frightenedFrames > 0 && !g.exempt ) g.speed = FRIGHT_SPEED;
    else g.speed = GHOST_SPEED;
    decideGhost( game, g );
    // Validar tambien con el actor correcto: los ojos re-entran a la pen.
    if ( !canMove( grid, g.x, g.y, g.dir, g.eaten ? 'eyes' : 'ghost' ) ) return;
  }

  const d = DIRS[ g.dir ];
  g.x += d.x * g.speed;
  g.y += d.y * g.speed;
  wrapTunnel( g, width );
}

function resetPositions( game ) {
  const p = game.pacman;
  p.x = PACMAN_START.x;
  p.y = PACMAN_START.y;
  p.dir = 'left';
  p.nextDir = null;
  // Limpiar todo el estado del modo asustado (SPEC 04): tras una muerte no
  // quedan azules, ojos, cadenas, congelados ni cifras — arranque limpio.
  game.frightenedFrames = 0;
  game.ghostEatChain = 0;
  game.freezeFrames = 0;
  game.popup = null;
  game.ghosts.forEach( ( g, i ) => {
    g.x = GHOST_STARTS[ i ].x;
    g.y = GHOST_STARTS[ i ].y;
    g.dir = 'up';
    // Re-aplicar el retardo completo: el escalonado se repite tras cada colision.
    g.waitFrames = GHOST_RELEASE_FRAMES[ g.kind ];
    g.eaten = false;
    g.exempt = false;
    g.speed = GHOST_SPEED;
  } );
}

function collides( a, b ) {
  return Math.abs( a.x - b.x ) < 0.5 && Math.abs( a.y - b.y ) < 0.5;
}

function update( game ) {
  // Gate de congelado (SPEC 04): al comer un fantasma el juego se pausa
  // ~0.5 s mostrando la cifra en su lugar. Solo decrementa el congelado y
  // retorna — el modo asustado tambien se pausa; nada mas de update se toca.
  if ( game.freezeFrames > 0 ) {
    game.freezeFrames--;
    if ( game.freezeFrames === 0 ) game.popup = null; // vive exactamente mientras el congelado
    return;
  }
  movePacman( game );
  game.ghosts.forEach( ( g ) => moveGhost( game, g ) );

  // Cuenta atras del modo asustado (SPEC 04): tras el movimiento, para que
  // el modo cubra sus 360 frames completos. Al expirar no hace falta
  // restauracion explicita: velocidad, color y decisiones vuelven a lo
  // normal solos via los checks de frightenedFrames.
  if ( game.frightenedFrames > 0 ) game.frightenedFrames--;

  for ( const g of game.ghosts ) {
    if ( !collides( game.pacman, g ) ) continue;
    // Ojos (SPEC 04): inofensivos — ni quitan vida ni se dejan comer.
    if ( g.eaten ) continue;
    // Fantasma asustado comestible (SPEC 04): puntos de la cadena, congelado
    // y cifra pintada en su lugar. (min: la cadena no excede GHOST_POINTS.)
    if ( game.frightenedFrames > 0 && !g.exempt ) {
      const points = GHOST_POINTS[ Math.min( game.ghostEatChain, GHOST_POINTS.length - 1 ) ];
      game.ghostEatChain++;
      game.score += points;
      g.eaten = true;
      game.popup = { x: g.x, y: g.y, points };
      game.freezeFrames = FREEZE_FRAMES;
      continue;
    }
    game.lives--;
    if ( game.lives <= 0 ) {
      game.state = 'lost';
      return;
    }
    resetPositions( game );
    break;
  }

  if ( game.dotsRemaining <= 0 ) game.state = 'won';
}

window.createGame = createGame;
window.update = update;
window.DIRS = DIRS;
window.FRIGHT_WARN_FRAMES = FRIGHT_WARN_FRAMES; // render.js: parpadeo de aviso (SPEC 04)
