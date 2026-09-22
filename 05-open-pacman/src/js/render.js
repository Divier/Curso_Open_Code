// render.js
// Dibujo arcade sobre canvas. Usa game.grid (no MAZE) para reflejar dots comidos.

const TILE = 20;
const WALL_COLOR = '#2121ff';
const DOOR_COLOR = '#ffb8ff';
const DOT_COLOR = '#ffb897';

function cellCenter( x, y ) {
  return { cx: x * TILE + TILE / 2, cy: y * TILE + TILE / 2 };
}

// Paredes estilo arcade: lineas finas redondeadas que conectan los centros
// de celdas-pared adyacentes. Produce el trazado continuo del original.
function drawWalls( ctx, grid ) {
  const H = grid.length;
  const W = grid[ 0 ].length;
  ctx.strokeStyle = WALL_COLOR;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for ( let y = 0; y < H; y++ ) {
    for ( let x = 0; x < W; x++ ) {
      if ( grid[ y ][ x ] !== 1 ) continue;
      const { cx, cy } = cellCenter( x, y );
      // Conectar solo hacia derecha y abajo evita trazos duplicados.
      if ( x + 1 < W && grid[ y ][ x + 1 ] === 1 ) {
        ctx.moveTo( cx, cy );
        ctx.lineTo( cx + TILE, cy );
      }
      if ( y + 1 < H && grid[ y + 1 ][ x ] === 1 ) {
        ctx.moveTo( cx, cy );
        ctx.lineTo( cx, cy + TILE );
      }
      // Celda-pared aislada (sin vecino): punto corto para que se vea.
      const lone =
        ( x + 1 >= W || grid[ y ][ x + 1 ] !== 1 ) &&
        ( x - 1 < 0 || grid[ y ][ x - 1 ] !== 1 ) &&
        ( y + 1 >= H || grid[ y + 1 ][ x ] !== 1 ) &&
        ( y - 1 < 0 || grid[ y - 1 ][ x ] !== 1 );
      if ( lone ) {
        ctx.moveTo( cx - 3, cy );
        ctx.lineTo( cx + 3, cy );
      }
    }
  }
  ctx.stroke();
}

function drawDoor( ctx, grid ) {
  const H = grid.length;
  const W = grid[ 0 ].length;
  ctx.strokeStyle = DOOR_COLOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for ( let y = 0; y < H; y++ ) {
    for ( let x = 0; x < W; x++ ) {
      if ( grid[ y ][ x ] !== 3 ) continue;
      const px = x * TILE;
      const py = y * TILE + TILE / 2;
      ctx.moveTo( px, py );
      ctx.lineTo( px + TILE, py );
    }
  }
  ctx.stroke();
}

function drawDots( ctx, grid, frame ) {
  ctx.fillStyle = DOT_COLOR;
  for ( let y = 0; y < grid.length; y++ ) {
    for ( let x = 0; x < grid[ 0 ].length; x++ ) {
      const v = grid[ y ][ x ];
      if ( v !== 2 && v !== 4 ) continue;
      const { cx, cy } = cellCenter( x, y );
      // Power pellet (tile 4, SPEC 04): circulo mayor parpadeante,
      // ~0.25 s por fase (15 frames visible / 15 oculto).
      if ( v === 4 ) {
        if ( Math.floor( frame / 15 ) % 2 === 0 ) {
          ctx.beginPath();
          ctx.arc( cx, cy, 6.5, 0, Math.PI * 2 );
          ctx.fill();
        }
        continue;
      }
      ctx.beginPath();
      ctx.arc( cx, cy, 2.5, 0, Math.PI * 2 );
      ctx.fill();
    }
  }
}

function drawPacman( ctx, p, frame ) {
  const { cx, cy } = cellCenter( p.x, p.y );
  let rot = 0;
  if ( p.dir === 'right' ) rot = 0;
  else if ( p.dir === 'down' ) rot = Math.PI / 2;
  else if ( p.dir === 'left' ) rot = Math.PI;
  else if ( p.dir === 'up' ) rot = -Math.PI / 2;

  // Boca animada: abre/cierra con el frame.
  const open = ( Math.sin( frame * 0.3 ) * 0.5 + 0.5 ) * 0.28 + 0.02;

  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.moveTo( cx, cy );
  ctx.arc( cx, cy, TILE / 2 - 1, rot + open * Math.PI, rot - open * Math.PI );
  ctx.closePath();
  ctx.fill();
}

// Ojos del fantasma (blanco con pupila azul) mirando segun direccion. Los
// usan los fantasmas normales y, ellos solos, los ojos que vuelven a la pen
// tras ser comidos (SPEC 04).
function drawGhostEyes( ctx, cx, cy, dir ) {
  const d = DIRS[ dir ] || { x: 0, y: 0 };
  const ex = d.x * 1.6;
  const ey = d.y * 1.6;
  for ( const off of [ -3.5, 3.5 ] ) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc( cx + off, cy - 1, 3, 0, Math.PI * 2 );
    ctx.fill();
    ctx.fillStyle = '#0000bb';
    ctx.beginPath();
    ctx.arc( cx + off + ex, cy - 1 + ey, 1.5, 0, Math.PI * 2 );
    ctx.fill();
  }
}

function drawGhost( ctx, g, color, frame, aspect ) {
  const { cx, cy: baseCy } = cellCenter( g.x, g.y );
  // Rebote visual de espera (SPEC 03): bob vertical mientras waitFrames > 0.
  const cy = baseCy + ( g.waitFrames > 0 ? Math.sin( frame * 0.15 ) * 3 : 0 );

  // Par de ojos sin cuerpo (SPEC 04): el fantasma comido vuelve a la pen.
  if ( aspect === 'eyes' ) {
    drawGhostEyes( ctx, cx, cy, g.dir );
    return;
  }

  const r = TILE / 2 - 1;
  const top = cy - r;
  const bottom = cy + r;
  const left = cx - r;
  const right = cx + r;

  // Aspecto asustado (SPEC 04): azul, o blanco alternante en el aviso final.
  const look = FRIGHT_LOOK[ aspect ];
  ctx.fillStyle = look ? look.body : color;
  ctx.beginPath();
  ctx.arc( cx, cy - 1, r, Math.PI, 0, false ); // cabeza
  ctx.lineTo( right, bottom );
  // falda ondulada (3 picos)
  ctx.lineTo( right - r * 0.66, bottom - 4 );
  ctx.lineTo( cx, bottom );
  ctx.lineTo( left + r * 0.66, bottom - 4 );
  ctx.lineTo( left, bottom );
  ctx.closePath();
  ctx.fill();

  // Cara de susto (SPEC 04): ojos puntitos sin pupila y boca en zigzag.
  if ( look ) {
    ctx.fillStyle = look.face;
    for ( const off of [ -3.5, 3.5 ] ) {
      ctx.beginPath();
      ctx.arc( cx + off, cy - 2, 2.2, 0, Math.PI * 2 );
      ctx.fill();
    }
    ctx.strokeStyle = look.face;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo( cx - 6, cy + 5 );
    ctx.lineTo( cx - 4, cy + 2.5 );
    ctx.lineTo( cx - 2, cy + 5 );
    ctx.lineTo( cx, cy + 2.5 );
    ctx.lineTo( cx + 2, cy + 5 );
    ctx.lineTo( cx + 4, cy + 2.5 );
    ctx.lineTo( cx + 6, cy + 5 );
    ctx.stroke();
    return;
  }

  // ojos mirando segun direccion
  drawGhostEyes( ctx, cx, cy, g.dir );
}

function drawHUD( ctx, game, W ) {
  ctx.fillStyle = '#fff';
  ctx.font = '14px "Courier New", monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText( 'SCORE ' + game.score, 8, 4 );
  ctx.textAlign = 'right';
  ctx.fillText( 'VIDAS ' + game.lives, W * TILE - 8, 4 );
}

// Cifra de puntos del fantasma comido (SPEC 04): pintada en el lugar exacto
// donde estaba el fantasma mientras dura el congelado (~0.5 s).
function drawPopup( ctx, popup ) {
  const { cx, cy } = cellCenter( popup.x, popup.y );
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText( '' + popup.points, cx, cy );
}

// Color por personalidad (kind), no por indice.
const GHOST_COLORS = {
  blinky: '#ff0000', // rojo
  pinky: '#ffb8ff',  // rosa
  inky: '#00ffff',   // cian
  clyde: '#ffb852',  // naranja
};

// Aspecto asustado (SPEC 04): azul con cara de susto; en el aviso final
// (ultimos FRIGHT_WARN_FRAMES, global de game.js) alterna azul/blanco.
const FRIGHT_LOOK = {
  fright: { body: '#2121de', face: '#ffffff' }, // azul + cara blanca
  flash: { body: '#ffffff', face: '#ff0000' },  // blanco + cara roja
};

// Resuelve el aspecto de un fantasma: 'eyes' (comido: solo ojos, predomina
// sobre todo), 'normal' (color por kind), 'fright' (azul) o 'flash' (blanco,
// fases impares del aviso). Un exempt (revivido en este modo) nunca se azula.
function ghostAspect( game, g, frame ) {
  if ( g.eaten ) return 'eyes';
  if ( game.frightenedFrames <= 0 || g.exempt ) return 'normal';
  if ( game.frightenedFrames <= FRIGHT_WARN_FRAMES && Math.floor( frame / 15 ) % 2 === 1 ) {
    return 'flash';
  }
  return 'fright';
}

function draw( ctx, game, frame ) {
  const grid = game.grid;
  const W = grid[ 0 ].length;
  const H = grid.length;

  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, W * TILE, H * TILE );

  drawWalls( ctx, grid );
  drawDoor( ctx, grid );
  drawDots( ctx, grid, frame );
  drawPacman( ctx, game.pacman, frame );
  game.ghosts.forEach( ( g ) => {
    // Congelado (SPEC 04): el fantasma recien comido se esconde; su cifra
    // se pinta en su lugar mientras dura el congelado.
    if ( game.freezeFrames > 0 && game.popup && g.eaten &&
         g.x === game.popup.x && g.y === game.popup.y ) return;
    drawGhost( ctx, g, GHOST_COLORS[ g.kind ] || '#ff0000', frame, ghostAspect( game, g, frame ) );
  } );
  if ( game.popup && game.freezeFrames > 0 ) drawPopup( ctx, game.popup );
  drawHUD( ctx, game, W );
}

window.draw = draw;
