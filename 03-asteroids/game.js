'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

// Estrella fugaz: asteroide especial, muy rápido y con vida limitada
const STAR_SPEED_MIN = 280;   // px/s
const STAR_SPEED_MAX = 340;
const STAR_TTL       = 6;     // segundos antes de desvanecerse
const STAR_POINTS    = 150;
const STAR_SPAWN_MIN = 8;     // segundos entre apariciones
const STAR_SPAWN_MAX = 15;

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
class ShootingStar extends Asteroid {
  constructor(x, y, angle) {
    super(x, y, 1);
    const speed = rand(STAR_SPEED_MIN, STAR_SPEED_MAX);
    this.vx     = Math.cos(angle) * speed;
    this.vy     = Math.sin(angle) * speed;
    this.points = STAR_POINTS;
    this.ttl    = STAR_TTL;
  }

  update(dt) {
    if (this.dead) return;
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.dead = true;
      explode(this.x, this.y, 5);  // se desvanece en un destello
    }
  }

  split() { return []; }  // no se fragmenta

  draw() {
    // Parpadeo cuando está por desaparecer
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    // Estela desvanecida, opuesta a la dirección de movimiento
    ctx.save();
    ctx.strokeStyle = 'rgba(80, 220, 255, 0.35)';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x - this.vx * 0.16, this.y - this.vy * 0.16);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.restore();

    // Estrella de 4 puntas
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = 'rgba(80, 220, 255, 0.9)';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? this.radius : this.radius * 0.38;
      const a = (i / 8) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Solo cosmético: el radio de colisión (12) y el punto de disparo (NOSE = 21)
// son iguales para todos. shape es un polígono en coords locales (nariz hacia +x).
const SKINS = [
  {
    name: 'CLÁSICA',
    stroke: '#fff',
    lineWidth: 1.5,
    shape: [[20, 0], [-12, -9], [-7, 0], [-12, 9]],
    flame: 'rgba(255, 130, 0, 0.85)',
    boostFlame: 'rgba(80, 220, 255, 0.9)',
    flameX: -8,
  },
  {
    name: 'NEÓN',
    stroke: '#50dcff',
    lineWidth: 1.5,
    shape: [[22, 0], [-13, -10], [-7, -3], [-7, 3], [-13, 10]],
    flame: 'rgba(80, 220, 255, 0.9)',
    boostFlame: 'rgba(255, 255, 255, 0.95)',
    flameX: -8,
  },
  {
    name: 'MAGENTA',
    stroke: '#ff6ec7',
    lineWidth: 1.5,
    shape: [[19, 0], [-14, -11], [-14, 11]],
    flame: 'rgba(255, 110, 199, 0.85)',
    boostFlame: 'rgba(255, 205, 240, 0.95)',
    flameX: -14,
  },
  {
    name: 'DORADA',
    stroke: '#ffd23f',
    lineWidth: 1.5,
    shape: [[24, 0], [-11, -5], [-7, 0], [-11, 5]],
    flame: 'rgba(255, 210, 63, 0.9)',
    boostFlame: 'rgba(255, 255, 205, 0.95)',
    flameX: -8,
  },
  {
    name: 'VÍBORA',
    stroke: '#7dff6a',
    lineWidth: 1.5,
    shape: [[16, 0], [-4, -4], [-16, -9], [-10, 0], [-16, 9], [-4, 4]],
    flame: 'rgba(125, 255, 106, 0.85)',
    boostFlame: 'rgba(225, 255, 215, 0.95)',
    flameX: -10,
  },
];

let skinIndex = 0;
try {
  const saved = parseInt(localStorage.getItem('asteroids-skin'), 10);
  if (saved >= 0 && saved < SKINS.length) skinIndex = saved;
} catch (e) { /* localStorage no disponible */ }

let skinMsgTimer = 0;  // tiempo restante del aviso "NAVE: ..." en el HUD

function cycleSkin() {
  skinIndex = (skinIndex + 1) % SKINS.length;
  skinMsgTimer = 1.5;
  try { localStorage.setItem('asteroids-skin', skinIndex); } catch (e) { /* sin persistencia */ }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.speedTimer    = 0;
    this.tripleTimer   = 0;
    this.shieldTimer   = 0;
    this.shootCooldown = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.tripleTimer   > 0) this.tripleTimer   -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = this.speedTimer > 0 ? 520 : 260;  // px/s² (doble con power-up)
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;

    // Triple shot: 3 balas paralelas con el mismo ángulo
    if (this.tripleTimer > 0) {
      const SPREAD = 6;   // separación lateral entre balas
      const px = -Math.sin(this.angle);
      const py =  Math.cos(this.angle);
      return [-1, 0, 1].map(s =>
        new Bullet(ox + px * SPREAD * s, oy + py * SPREAD * s, this.angle));
    }

    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    const skin = SKINS[skinIndex];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = skin.stroke;
    ctx.lineWidth   = skin.lineWidth;
    ctx.lineJoin    = 'round';

    // Silueta del skin activo (nariz hacia +x)
    ctx.beginPath();
    ctx.moveTo(skin.shape[0][0], skin.shape[0][1]);
    for (let i = 1; i < skin.shape.length; i++)
      ctx.lineTo(skin.shape[i][0], skin.shape[i][1]);
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor (color de boost durante el power-up de velocidad)
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(skin.flameX, -4);
      ctx.lineTo(skin.flameX - rand(6, 18), 0);
      ctx.lineTo(skin.flameX,  4);
      ctx.strokeStyle = this.speedTimer > 0
        ? skin.boostFlame
        : skin.flame;
      ctx.stroke();
    }

    ctx.restore();

    // Anillo del escudo: pulso suave y parpadeo cuando queda poco tiempo
    if (this.shieldTimer > 0 &&
        !(this.shieldTimer < 2 && Math.floor(this.shieldTimer * 8) % 2 === 0)) {
      const r = SHIELD_RADIUS + Math.sin(this.shieldTimer * 6) * 1.5;
      ctx.strokeStyle = 'rgba(80, 220, 255, 0.8)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups (velocidad / triple shot / escudo) ──────────────────────────────
const POWERUP_DROP_CHANCE = 0.12;  // probabilidad de drop al destruir un asteroide
const POWERUP_DURATION    = 5;     // segundos de boost de velocidad
const TRIPLE_DURATION     = 5;     // segundos de triple shot
const SHIELD_DURATION     = 5;     // segundos de escudo activo
const SHIELD_RADIUS       = 28;    // radio del anillo de escudo (la nave mide 12)
const POWERUP_TTL         = 8;     // segundos que dura en el campo sin recoger

class PowerUp {
  constructor(x, y, type = 'speed') {
    this.x      = x;
    this.y      = y;
    this.type   = type;
    this.radius = 12;
    this.ttl    = POWERUP_TTL;
    this.pulse  = rand(0, Math.PI * 2);
    this.dead   = false;
  }

  update(dt) {
    this.pulse += dt * 4;
    this.ttl   -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo cuando está por desaparecer
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    const s = 1 + Math.sin(this.pulse) * 0.12;  // pulso de escala
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);

    if (this.type === 'triple') {
      // Triple shot: 3 líneas paralelas
      ctx.strokeStyle = '#ff6ec7';
      ctx.lineWidth   = 2.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      for (const dx of [-5, 0, 5]) {
        ctx.moveTo(dx, -7);
        ctx.lineTo(dx,  7);
      }
      ctx.stroke();
    } else if (this.type === 'shield') {
      // Escudo: anillo con punto central
      ctx.strokeStyle = '#50dcff';
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#50dcff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Velocidad: rayo
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.moveTo(  2, -10);
      ctx.lineTo( -5,   2);
      ctx.lineTo( -1,   2);
      ctx.lineTo( -2,  10);
      ctx.lineTo(  5,  -2);
      ctx.lineTo(  1,  -2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let starTimer;  // cuenta atrás para la próxima estrella fugaz

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnShootingStar() {
  // Aparece en un borde aleatorio, apuntando hacia el interior del campo
  const side = randInt(0, 3);
  let x, y;
  if      (side === 0) { x = rand(0, W); y = 0; }
  else if (side === 1) { x = rand(0, W); y = H; }
  else if (side === 2) { x = 0; y = rand(0, H); }
  else                 { x = W; y = rand(0, H); }
  const tx = rand(W * 0.25, W * 0.75);
  const ty = rand(H * 0.25, H * 0.75);
  const angle = Math.atan2(ty - y, tx - x);
  asteroids.push(new ShootingStar(x, y, angle));
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  starTimer = rand(STAR_SPAWN_MIN, STAR_SPAWN_MAX);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Cambio de skin con S (disponible en cualquier estado)
  if (pressed('KeyS')) cycleSkin();
  if (skinMsgTimer > 0) skinMsgTimer -= dt;

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    asteroids = asteroids.filter(a => !a.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  // Aparición periódica de la estrella fugaz
  starTimer -= dt;
  if (starTimer <= 0) {
    spawnShootingStar();
    starTimer = rand(STAR_SPAWN_MIN, STAR_SPAWN_MAX);
  }

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points;
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        if (!(a instanceof ShootingStar) && Math.random() < POWERUP_DROP_CHANCE)
          powerups.push(new PowerUp(a.x, a.y, ['speed', 'triple', 'shield'][randInt(0, 2)]));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide: con el escudo activo, el asteroide se destruye al tocar el anillo
  if (ship.invincible <= 0) {
    const shielded = ship.shieldTimer > 0;
    const hitRadius = shielded ? SHIELD_RADIUS : ship.radius;
    for (const a of asteroids) {
      if (dist(ship, a) < hitRadius + (shielded ? a.radius : a.radius * 0.82)) {
        if (shielded) {
          a.dead = true;
          explode(a.x, a.y, a.size * 5);
          asteroids = asteroids.filter(ast => !ast.dead);
        } else {
          killShip();
        }
        break;
      }
    }
  }

  // Nave vs power-up: reinicia el timer a 5 s (no acumula)
  for (const pu of powerups) {
    if (!pu.dead && dist(ship, pu) < ship.radius + pu.radius) {
      pu.dead = true;
      if (pu.type === 'triple')      ship.tripleTimer = TRIPLE_DURATION;
      else if (pu.type === 'shield') ship.shieldTimer = SHIELD_DURATION;
      else                           ship.speedTimer = POWERUP_DURATION;
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const skin = SKINS[skinIndex];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.6, 0.6);
  ctx.strokeStyle = skin.stroke;
  ctx.lineWidth   = 2;   // compensa la escala para un grosor efectivo de 1.2
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.shape[0][0], skin.shape[0][1]);
  for (let i = 1; i < skin.shape.length; i++)
    ctx.lineTo(skin.shape[i][0], skin.shape[i][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  if (!ship.dead) {
    const buffs = [];
    if (ship.speedTimer > 0)
      buffs.push([`VELOCIDAD ${ship.speedTimer.toFixed(1)}s`, '#ffd23f']);
    if (ship.tripleTimer > 0)
      buffs.push([`TRIPLE ${ship.tripleTimer.toFixed(1)}s`, '#ff6ec7']);
    if (ship.shieldTimer > 0)
      buffs.push([`ESCUDO ${ship.shieldTimer.toFixed(1)}s`, '#50dcff']);
    buffs.forEach(([text, color], i) => {
      ctx.fillStyle = color;
      ctx.fillText(text, 14, 48 + i * 22);
    });
    ctx.fillStyle = '#fff';
  }

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  if (skinMsgTimer > 0) {
    ctx.fillStyle = SKINS[skinIndex].stroke;
    ctx.fillText(`NAVE: ${SKINS[skinIndex].name}`, W / 2, 48);
    ctx.fillStyle = '#fff';
  }

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
