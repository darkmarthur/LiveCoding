// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧    Bacto Swarm     ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ by Mario D. Quiroz ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

let agents = [];
let dust = []; // <<< NEW: passive tracers

// ---------------- TUNING ----------------
const COUNT_PER_SWARM = 30; // total = 2 * COUNT_PER_SWARM
const NOISE_SCALE = 0.0018;
const FADE = 8;
const JITTER = 0.25;
const SPEED = 1.4;
const RMIN = 10,
  RMAX = 26;

// Palettes
const COLD = ["#a7f3d0", "#6ee7b7", "#5eead4", "#22d3ee", "#60a5fa"]; // bluish
const WARM = ["#f9c74f", "#f9844a", "#f8961e", "#f3722c", "#f94144"]; // reddish

// Neighbors / separation
const K_NEIGHBORS = 5;
const SPACE_FACTOR = 0.6;
const SEP_STRENGTH = 0.03;
const NEIGHBOR_REFRESH = 8;

// Boids-lite (applied within same swarm only)
const ALIGN_STRENGTH = 0.035;
const COHESION_STRENGTH = 0.0001;

// Direction discipline (keep bands going their way)
const GOAL_ALIGN = 0.06;
const GOAL_FORCE = 0.00001;

// Separation multipliers
const SEP_OTHER_MULT = 1.8; // stronger repulsion versus other band
const SEP_SAME_MULT = 1.0;

// Collisions (position-based relaxation)
const COLLISION_ITERS = 3;
const SLOP = 0.8;

// swarm ids
const BLUE = 0,
  RED = 1;

// ----------- NEW: Flow visualization controls -----------
const DUST_COUNT = 100; // number of tracer specks
const DUST_SPEED = 0.9; // tracer speed (independent from agents)
const DUST_ALPHA = 28; // 0..255 alpha per speck (very low)
const DUST_SIZE_MIN = 0.8,
  DUST_SIZE_MAX = 1.8;
const DUST_JITTER = 0.15; // tiny randomness so they don't all overlap
const SHOW_GLYPHS = false; // set true to draw flow dashes
const GLYPH_STEP = 36; // grid spacing in px
const GLYPH_LEN = 14; // dash length
const GLYPH_ALPHA = 45; // dash transparency

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  initAgents();
  initDust(); // <<< NEW
  refreshNeighbors();
  background(8);
}

function draw() {
  // trails
  fill(8, FADE);
  rect(0, 0, width, height);

  const t = frameCount * 0.002;

  // ---------- PASS 0: FLOW DUST (shows the flow field) ----------
  // Draw behind everything else. Uses ADD for subtle glow specks.
  blendMode(ADD);
  for (let d of dust) {
    // same flow field as agents
    const a = noise(d.x * NOISE_SCALE, d.y * NOISE_SCALE, t + d.oz) * TAU * 2.0;
    // steer
    d.vx += cos(a) * 0.05;
    d.vy += sin(a) * 0.05;

    // tiny jitter so they don’t form perfect streaks
    d.vx += (random() - 0.5) * DUST_JITTER * 0.02;
    d.vy += (random() - 0.5) * DUST_JITTER * 0.02;

    // clamp to dust speed
    const sp = sqrt(d.vx * d.vx + d.vy * d.vy) + 1e-6;
    d.vx = (d.vx / sp) * DUST_SPEED;
    d.vy = (d.vy / sp) * DUST_SPEED;

    // integrate + wrap
    d.x += d.vx;
    d.y += d.vy;
    if (d.x < -10) d.x = width + 10;
    if (d.x > width + 10) d.x = -10;
    if (d.y < -10) d.y = height + 10;
    if (d.y > height + 10) d.y = -10;

    // draw speck
    fill(255, DUST_ALPHA); // white-ish glow; low alpha
    circle(d.x, d.y, d.r);
  }

  // ---------- OPTIONAL: FLOW GLYPHS (tiny dashes oriented by flow) ----------
  if (SHOW_GLYPHS) {
    blendMode(BLEND);
    stroke(200, GLYPH_ALPHA);
    strokeWeight(1);
    for (let gy = GLYPH_STEP / 2; gy < height; gy += GLYPH_STEP) {
      for (let gx = GLYPH_STEP / 2; gx < width; gx += GLYPH_STEP) {
        const a = noise(gx * NOISE_SCALE, gy * NOISE_SCALE, t) * TAU * 2.0;
        const dx = cos(a) * GLYPH_LEN * 0.5;
        const dy = sin(a) * GLYPH_LEN * 0.5;
        line(gx - dx, gy - dy, gx + dx, gy + dy);
      }
    }
    noStroke();
  }

  // ---------- PASS 1: PHYSICS UPDATE (agents) ----------
  for (let a of agents) {
    // (A) flow steering
    const ang =
      noise(a.x * NOISE_SCALE, a.y * NOISE_SCALE, t + a.oz) * TAU * 2.0;
    a.vx += cos(ang) * 0.06;
    a.vy += sin(ang) * 0.06;

    // (B) individuality
    a.vx += (random() - 0.5) * JITTER * 0.02;
    a.vy += (random() - 0.5) * JITTER * 0.02;

    // (C) tiny directional push (blue →, red ←)
    if (a.g === BLUE) a.vx += GOAL_FORCE;
    else a.vx -= GOAL_FORCE;

    // (D) PERSONAL SPACE: stronger against other band
    let fx = 0,
      fy = 0;
    for (let n of a.nbrs) {
      const dx = a.x - n.x,
        dy = a.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 === 0) continue;
      const desired = (a.r + n.r) * SPACE_FACTOR;
      if (d2 < desired * desired) {
        const inv = 1.0 / sqrt(d2);
        const sepMult = n.g !== a.g ? SEP_OTHER_MULT : SEP_SAME_MULT;
        fx += dx * inv * (SEP_STRENGTH * sepMult);
        fy += dy * inv * (SEP_STRENGTH * sepMult);
      }
    }
    a.vx += fx;
    a.vy += fy;

    // (E) ALIGN + COHESION within same band
    if (a.nbrs.length > 0) {
      let avx = 0,
        avy = 0,
        cx = 0,
        cy = 0,
        c = 0;
      for (let n of a.nbrs) {
        if (n.g !== a.g) continue;
        avx += n.vx;
        avy += n.vy;
        cx += n.x;
        cy += n.y;
        c++;
      }
      if (c > 0) {
        avx /= c;
        avy /= c;
        a.vx = lerp(a.vx, avx, ALIGN_STRENGTH);
        a.vy = lerp(a.vy, avy, ALIGN_STRENGTH);

        cx /= c;
        cy /= c;
        a.vx += (cx - a.x) * COHESION_STRENGTH;
        a.vy += (cy - a.y) * COHESION_STRENGTH;
      }
    }

    // (F) GOAL ALIGN: keep band heading (horizontal)
    const gx = a.g === BLUE ? 1 : -1;
    a.vx = lerp(a.vx, gx * a.spd, GOAL_ALIGN);
    a.vy = lerp(a.vy, 0, GOAL_ALIGN * 0.5);

    // (G) clamp speed to per-agent target
    const sp = sqrt(a.vx * a.vx + a.vy * a.vy) + 1e-6;
    a.vx = (a.vx / sp) * a.spd;
    a.vy = (a.vy / sp) * a.spd;

    // (H) integrate
    a.x += a.vx;
    a.y += a.vy;

    // (I) wrap
    if (a.x < -a.r) a.x = width + a.r;
    if (a.x > width + a.r) a.x = -a.r;
    if (a.y < -a.r) a.y = height + a.r;
    if (a.y > height + a.r) a.y = -a.r;

    // (J) ensure a minimum forward component (optional safety)
    const minForward = 0.35 * a.spd;
    if (a.g === BLUE) a.vx = max(a.vx, minForward);
    else a.vx = min(a.vx, -minForward);
  }

  // ---------- PASS 1.5: COLLISIONS (sliding) ----------
  for (let iter = 0; iter < COLLISION_ITERS; iter++) resolveCollisions();

  // ---------- PASS 2: GLOW BODIES ----------
  blendMode(HARD_LIGHT); // or ADD
  for (let a of agents) {
    drawBlob(a.x, a.y, a.r, a.c);
  }

  // ---------- PASS 3: EYES ----------
  blendMode(BLEND);
  for (let a of agents) {
    const dir = atan2(a.vy, a.vx);
    const fwd = p5.Vector.fromAngle(dir);
    const perp = p5.Vector.fromAngle(dir + HALF_PI);

    const fwdOffset = a.r * 0.22;
    const sideOffset = a.r * 0.18;
    const eyeR = max(2, a.r * 0.14);

    const cx = a.x + fwd.x * fwdOffset;
    const cy = a.y + fwd.y * fwdOffset;
    const lx = cx + perp.x * sideOffset;
    const ly = cy + perp.y * sideOffset;
    const rx = cx - perp.x * sideOffset;
    const ry = cy - perp.y * sideOffset;

    noStroke();
    fill(255, 235);
    circle(lx, ly, eyeR * 2);
    circle(rx, ry, eyeR * 2);

    const pupOff = a.r * 0.06;
    fill(20, 220);
    circle(lx + fwd.x * pupOff, ly + fwd.y * pupOff, eyeR * 0.65);
    circle(rx + fwd.x * pupOff, ry + fwd.y * pupOff, eyeR * 0.65);
  }

  if (frameCount % NEIGHBOR_REFRESH === 0) refreshNeighbors();
}

// -------- NEW: Flow dust init --------
function initDust() {
  dust = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    dust.push({
      x: random(width),
      y: random(height),
      vx: random(-1, 1) * 0.1,
      vy: random(-1, 1) * 0.1,
      r: random(DUST_SIZE_MIN, DUST_SIZE_MAX),
      oz: random(1000), // per-particle noise offset
    });
  }
}

function initAgents() {
  agents = [];

  // BLUE swarm (left → right)
  for (let i = 0; i < COUNT_PER_SWARM; i++) {
    const col = color(random(COLD));
    agents.push({
      id: i,
      g: BLUE,
      x: random(-50, width * 0.35),
      y: random(40, height - 40),
      vx: random(0.2, 1.0),
      vy: random(-0.6, 0.6),
      r: random(RMIN, RMAX),
      c: col,
      oz: random(1000),
      spd: SPEED * random(0.85, 1.2),
      nbrs: [],
    });
  }

  // RED swarm (right ← left)
  for (let i = 0; i < COUNT_PER_SWARM; i++) {
    const col = color(random(WARM));
    agents.push({
      id: COUNT_PER_SWARM + i,
      g: RED,
      x: random(width * 0.65, width + 50),
      y: random(40, height - 40),
      vx: random(-1.0, -0.2),
      vy: random(-0.6, 0.6),
      r: random(RMIN, RMAX),
      c: col,
      oz: random(1000),
      spd: SPEED * random(0.85, 1.2),
      nbrs: [],
    });
  }
}

function refreshNeighbors() {
  const k = K_NEIGHBORS;
  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const dists = [];
    for (let j = 0; j < agents.length; j++) {
      if (i === j) continue;
      const b = agents[j];
      const dx = a.x - b.x,
        dy = a.y - b.y;
      dists.push({ b, d2: dx * dx + dy * dy });
    }
    dists.sort((u, v) => u.d2 - v.d2);
    a.nbrs = dists.slice(0, k).map((o) => o.b);
  }
}

function resolveCollisions() {
  for (let a of agents) {
    for (let b of a.nbrs) {
      if (a.id >= b.id) continue;

      const dx = b.x - a.x,
        dy = b.y - a.y;
      const dist2 = dx * dx + dy * dy;
      const rsum = a.r + b.r;

      if (dist2 <= (rsum - SLOP) * (rsum - SLOP)) {
        const dist = sqrt(dist2) || 1e-6;
        const nx = dx / dist,
          ny = dy / dist; // normal a->b
        const pen = rsum - dist - SLOP;
        if (pen > 0) {
          // positional correction (split half/half)
          const corr = pen * 0.5;
          a.x -= nx * corr;
          a.y -= ny * corr;
          b.x += nx * corr;
          b.y += ny * corr;

          // velocity response: remove inward normal, keep/encourage tangential
          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;

          const relN = rvx * nx + rvy * ny; // along normal
          const tx = -ny,
            ty = nx; // tangent
          const relT = rvx * tx + rvy * ty; // along tangent

          if (relN < 0) {
            // 1) kill inward normal (no sticking/bounce)
            const jn = -relN * 0.5; // split evenly
            const jnx = jn * nx,
              jny = jn * ny;
            a.vx -= jnx;
            a.vy -= jny;
            b.vx += jnx;
            b.vy += jny;

            // 2) preserve / encourage sliding along tangent
            const slideGain = 0.1;
            const jt = relT * slideGain * 0.5;
            const jtx = jt * tx,
              jty = jt * ty;
            a.vx -= jtx;
            a.vy -= jty;
            b.vx += jtx;
            b.vy += jty;
          }
        }
      }
    }
  }
}

function drawBlob(cx, cy, r, col) {
  const steps = 3;
  for (let i = steps; i >= 1; i--) {
    const rr = r * (i / steps);
    const a = 22 * i;
    fill(red(col), green(col), blue(col), a);
    circle(cx, cy, rr * 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(8);
  initAgents();
  initDust(); // <<< NEW
  refreshNeighbors();
}
