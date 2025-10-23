// p5 + Matter.js — real collisions, visually deforming “soft” bubbles
// Assumes Matter.js is loaded (Matter namespace available)

// Aliases
const { Engine, World, Bodies, Body } = Matter;

let engine, world;
let bubbles = [];

// ---------- Physics & spawn ----------
const START_COUNT = 6;
const MAX_BUBBLES = 120;
const SPAWN_EVERY = 10;
const SPAWN_CHANCE = 0.6;

const R_MIN = 12;
const R_MAX = 46;
const GROWTH_MIN = 0.02;
const GROWTH_MAX = 0.045;

const AIR_DRAG = 0.03;
const RESTITUTION = 0.95;
const FRICTION = 0.0005;
const DENSITY = 0.0015;

// Mouse attractor (optional)
const MOUSE_RADIUS = 180;
const MOUSE_PULL = 0.0001;

// ---------- Deformation (visual only) ----------
const SAMPLES = 120; // angular samples per ring (96–160)
const LINE_W = 2.2;
const GAP_VIS = 6.0; // “air” between outlines (visual)
const INFL_PAD = 40; // neighbor influence reach
const DENT_GAIN = 0.9; // how strongly neighbors dent (0.6–1.2)
const DIR_EXP = 3.0; // localized in the facing direction (2–4)
const SQUASH_GAIN = 0.22; // velocity-based squash amount (0..~0.35)
const MIN_FRAC = 0.55; // don’t let any radius fall below base * MIN_FRAC
const SMOOTH_BLUR = 3; // small circular blur for smooth curves

// Visuals
const BG = 8;
const PALETTE = [
  "#60a5fa",
  "#22d3ee",
  "#5eead4",
  "#34d399",
  "#f9c74f",
  "#f8961e",
  "#f94144",
  "#c084fc",
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();
  background(BG);

  // Matter engine
  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;

  // sturdier solver
  engine.positionIterations = 10;
  engine.velocityIterations = 8;
  engine.constraintIterations = 2;

  // big offscreen walls
  const wallT = 2000;
  const walls = [
    Bodies.rectangle(width / 2, -wallT, width * 3, wallT * 2, {
      isStatic: true,
    }),
    Bodies.rectangle(width / 2, height + wallT, width * 3, wallT * 2, {
      isStatic: true,
    }),
    Bodies.rectangle(-wallT, height / 2, wallT * 2, height * 3, {
      isStatic: true,
    }),
    Bodies.rectangle(width + wallT, height / 2, wallT * 2, height * 3, {
      isStatic: true,
    }),
  ];
  World.add(world, walls);

  for (let i = 0; i < START_COUNT; i++) spawnBubble();
}

function draw() {
  background(BG);

  // gentle spawning
  if (
    frameCount % SPAWN_EVERY === 0 &&
    bubbles.length < MAX_BUBBLES &&
    random() < SPAWN_CHANCE
  )
    spawnBubble();

  // mouse pull (only inside canvas)
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    const mx = mouseX,
      my = mouseY;
    for (let b of bubbles) {
      const bx = b.body.position.x,
        by = b.body.position.y;
      const dx = mx - bx,
        dy = my - by;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
        const d = sqrt(d2) + 1e-6;
        Body.applyForce(
          b.body,
          { x: bx, y: by },
          { x: (dx / d) * MOUSE_PULL, y: (dy / d) * MOUSE_PULL }
        );
      }
    }
  }

  // grow bodies using Matter scaling (keeps collisions accurate)
  for (let b of bubbles) {
    const curR = b.body.circleRadius;
    if (curR < b.targetR) {
      const remain = b.targetR / max(1e-6, curR);
      const step = 1 + min(b.growth, remain - 1);
      Body.scale(b.body, step, step);
    }
  }

  Engine.update(engine, 1000 / 60);

  // ---------- DRAW (deforming outlines) ----------
  strokeWeight(LINE_W);

  // Build a lightweight neighbor list (O(n^2) is fine for ~120)
  const ptsCache = []; // reuse angle table
  const angles = new Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) angles[i] = (i / SAMPLES) * TAU;

  for (let i = 0; i < bubbles.length; i++) {
    const bi = bubbles[i];
    const pi = bi.body.position;
    const ri = bi.body.circleRadius;
    const vx = bi.body.velocity.x;
    const vy = bi.body.velocity.y;
    const sp = sqrt(vx * vx + vy * vy);
    const head = atan2(vy, vx);

    // base array of radii (start from the physics radius)
    const r = new Array(SAMPLES);
    const floorR = ri * MIN_FRAC;

    // 1) start with velocity squash (elliptical-ish)
    // squash amount grows with speed but capped
    const sqAmt = min(0.35, SQUASH_GAIN * sp); // 0..~0.35
    for (let k = 0; k < SAMPLES; k++) {
      const th = angles[k];
      const c = cos(th - head);
      // flatten along the motion axis: reduce radius at c≈±1
      const squash = sqAmt * c * c; // 0..sqAmt
      r[k] = ri * (1 - squash);
    }

    // 2) neighbor dents (localized, only forward half-space toward neighbor)
    for (let j = 0; j < bubbles.length; j++) {
      if (i === j) continue;
      const bj = bubbles[j];
      const pj = bj.body.position;
      const rj = bj.body.circleRadius;

      const dx = pj.x - pi.x,
        dy = pj.y - pi.y;
      const d = sqrt(dx * dx + dy * dy) + 1e-6;
      if (d > ri + rj + INFL_PAD) continue; // too far to matter

      for (let k = 0; k < SAMPLES; k++) {
        const th = angles[k];
        const ux = cos(th),
          uy = sin(th);
        const cosA = (dx * ux + dy * uy) / d;
        if (cosA <= 0) continue; // only in front of the ray

        // how close are we vs desired visual gap?
        const need = ri + rj + GAP_VIS - d; // can be negative (no dent)
        if (need <= 0) continue;

        // directional falloff + size bias
        const wDir = pow(cosA, DIR_EXP);
        const sizeBias = rj / (ri + rj);

        // dent amount (clamped so it never collapses below floorR)
        const dent = need * wDir * sizeBias * DENT_GAIN;
        r[k] = max(floorR, r[k] - dent);
      }
    }

    // 3) smooth radii around the circle a bit to remove sharp kinks
    circularSmoothInPlace(r, SMOOTH_BLUR);

    // 4) draw as a smooth closed curve
    stroke(bi.color);
    beginShape();
    // add two extra points to close the p5 curve cleanly
    const pA = polarToXY(pi.x, pi.y, angles[SAMPLES - 1], r[SAMPLES - 1]);
    const pB = polarToXY(pi.x, pi.y, angles[0], r[0]);
    const pC = polarToXY(pi.x, pi.y, angles[1], r[1]);
    curveVertex(pA.x, pA.y);
    curveVertex(pB.x, pB.y);
    for (let k = 0; k < SAMPLES; k++) {
      const p = polarToXY(pi.x, pi.y, angles[k], r[k]);
      curveVertex(p.x, p.y);
    }
    curveVertex(pC.x, pC.y);
    curveVertex(pA.x, pA.y);
    endShape(CLOSE);
  }
}

// ---------- Helpers ----------
function polarToXY(cx, cy, th, rr) {
  return { x: cx + cos(th) * rr, y: cy + sin(th) * rr };
}

function circularSmoothInPlace(arr, k) {
  if (k <= 0) return;
  const n = arr.length;
  const out = new Array(n);
  const win = 2 * k + 1;
  for (let i = 0; i < n; i++) {
    let s = 0,
      c = 0;
    for (let t = -k; t <= k; t++) {
      const j = (i + t + n) % n;
      s += arr[j];
      c++;
    }
    out[i] = s / c;
  }
  for (let i = 0; i < n; i++) arr[i] = out[i];
}

function spawnBubble() {
  const rTarget = random(R_MIN, R_MAX);
  const x = random(rTarget, width - rTarget);
  const y = random(rTarget, height - rTarget);

  const r0 = max(1, rTarget * 0.15);
  const body = Bodies.circle(x, y, r0, {
    frictionAir: AIR_DRAG,
    restitution: RESTITUTION,
    friction: FRICTION,
    density: DENSITY,
  });
  Body.setVelocity(body, { x: random(-0.3, 0.3), y: random(-0.3, 0.3) });
  World.add(world, body);

  bubbles.push({
    body,
    targetR: rTarget,
    growth: random(GROWTH_MIN, GROWTH_MAX),
    color: color(random(PALETTE)),
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(BG);
}
