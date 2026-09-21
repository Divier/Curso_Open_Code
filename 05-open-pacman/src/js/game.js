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

// Personalidades clasicas: constantes de los destinos de orientacion.
const AMBUSH_AHEAD = 4;                // celdas delante de Pac-Man para pinky
const FLANK_AHEAD = 2;                 // celdas delante para el vector de inky
const CLYDE_RANGE = 8;                 // distancia Manhattan que activa la timidez
const CLYDE_CORNER = { x: 0, y: 30 };  // esquina inferior-izquierda de clyde

// Crea una partida nueva. Copia MAZE (pristino) a game.grid para poder comer
// dots sin destruir el original, y reiniciar.
function createGame() {
  const grid = MAZE.map( ( row ) => row.slice() );
  // La celda de inicio de Pacman arranca sin dot.
  grid[ PACMAN_START.y ][ PACMAN_START.x ] = 0;

  let dots = 0;
  for ( const row of grid ) for ( const v of row ) if ( v === 2 ) dots++;

  return {
    state: 'start',
    score: 0,
    lives: 3,
    dotsRemaining: dots,
    grid,
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
    } ) ),
  };
}

function aligned( v ) {
  return Math.abs( v - Math.round( v ) ) < 1e-3;
}

// Una celda es muro para el actor dado?
//   pacman: bloqueado por pared (1) y puerta (3)
//   ghost:  bloqueado solo por pared (1)
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
    // Comer dot.
    if ( grid[ p.y ][ p.x ] === 2 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += 10;
      game.dotsRemaining--;
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
  const options = Object.keys( DIRS ).filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir, 'ghost' )
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

function decideGhost( game, g ) {
  // Modo salida (SPEC 02): dentro de la pen el destino de orientacion es la
  // celda sobre la puerta; la personalidad se retoma al pisar el mapa.
  if ( isPenCell( g.x, g.y ) ) {
    g.dir = chooseGreedy( game.grid, g, penExitTarget( g ) );
    return;
  }
  // Las cuatro personalidades resuelven un destino y eligen greedy hacia el.
  g.dir = chooseGreedy( game.grid, g, ghostTarget( game, g ) );
}

function moveGhost( game, g ) {
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( g.x ) && aligned( g.y ) ) {
    g.x = Math.round( g.x );
    g.y = Math.round( g.y );
    decideGhost( game, g );
    if ( !canMove( grid, g.x, g.y, g.dir, 'ghost' ) ) return;
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
  game.ghosts.forEach( ( g, i ) => {
    g.x = GHOST_STARTS[ i ].x;
    g.y = GHOST_STARTS[ i ].y;
    g.dir = 'up';
  } );
}

function collides( a, b ) {
  return Math.abs( a.x - b.x ) < 0.5 && Math.abs( a.y - b.y ) < 0.5;
}

function update( game ) {
  movePacman( game );
  game.ghosts.forEach( ( g ) => moveGhost( game, g ) );

  for ( const g of game.ghosts ) {
    if ( collides( game.pacman, g ) ) {
      game.lives--;
      if ( game.lives <= 0 ) {
        game.state = 'lost';
        return;
      }
      resetPositions( game );
      break;
    }
  }

  if ( game.dotsRemaining <= 0 ) game.state = 'won';
}

window.createGame = createGame;
window.update = update;
window.DIRS = DIRS;
