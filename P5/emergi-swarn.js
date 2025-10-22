// noprotect
// Smooth Bubble Growth — random spawns, continuous curves, soft dents,
// and a collision/repulsion step so bubbles NEVER touch.

// ---------- pacing ----------
const START_COUNT = 1;
const MAX_BUBBLES = 240;
const SPAWN_EVERY = 5; // frames between spawn tries
const SPAWN_CHANCE = 0.6; // probability a try actually spawns

// ---------- growth ----------
const R_MIN = 12,
  R_MAX = 46;
const GROWTH_MIN = 0.006;
const GROWTH_MAX = 0.012;

// ---------- deformation & spacing ----------
const GAP = 6.0; // minimum space between bubbles (px)
const PUSH_GAIN = 0.0; // dent strength from neighbors (0.7–1.1)
const DIR_EXP = 3.0; // directional falloff for dents
const INFL_PAD = 40; // extra influence range for dents (px)

// ---------- rendering ----------
const RING_COUNT = 7; // rings per bubble
const RING_STEP = 0.12; // shrink per inner ring (fraction of radius)
const SAMPLES = 96; // angular samples per ring (96–144 smooth)
const LINE_W = 1.8; // line thickness (canvas space)
const BG = 8;

// supersampled offscreen buffer for anti-aliasing
const SSAA = 2; // 1=off, 2=recommended

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

let bubbles = [];
let nextId = 1;

// spatial hash (for fast neighbor queries + collision pairs)
let cellSize, grid, gc, gr;

let gbuf; // supersampled graphics buffer

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  background(BG);

  gbuf = createGraphics(width * SSAA, height * SSAA);
  gbuf.pixelDensity(1);
  gbuf.strokeJoin(ROUND);
  gbuf.strokeCap(ROUND);

  // cell size ~ max interaction/spacing range
  cellSize = max(32, R_MAX + R_MAX + INFL_PAD + GAP);
  resizeGrid();

  for (let i = 0; i < START_COUNT; i++) spawnBubble();
}

function draw() {
  background(BG);

  // gentle spawn pacing
  if (
    frameCount % SPAWN_EVERY === 0 &&
    bubbles.length < MAX_BUBBLES &&
    random() < SPAWN_CHANCE
  ) {
    spawnBubble();
  }

  // growth 0 → target, smooth ease
  for (let b of bubbles) {
    if (b.scale < 1) {
      b.scale = min(1, b.scale + b.growth);
      const s = 0.6 * easeOutCubic(b.scale) + 0.4 * easeOutQuint(b.scale);
      b.r = max(0.001, b.rTarget * s);
    }
  }

  // build spatial grid
  clearGrid();
  binBubbles();

  // **repulsion step**: keep a minimum gap so they never touch
  resolveCollisionsGrid();

  // render to supersampled buffer
  gbuf.clear();
  gbuf.push();
  gbuf.scale(SSAA);
  gbuf.noFill();
  gbuf.strokeWeight(LINE_W * SSAA);

  for (let b of bubbles) {
    for (let k = 0; k < RING_COUNT; k++) {
      const frac = max(0.05, 1 - k * RING_STEP);
      const r0 = b.r * frac;

      const col = color(PALETTE[k % PALETTE.length]);
      gbuf.stroke(red(col), green(col), blue(col), 230);

      drawDeformedRing(b, r0);
    }
  }

  gbuf.pop();
  image(gbuf, 0, 0, width, height);
}

// ---- draw one ring as a smooth closed curve with polar deformation ----
function drawDeformedRing(b, baseR) {
  const nbrs = gatherNeighbors(b); // nearby bubbles once

  const n = SAMPLES;
  const pts = new Array(n);
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU;
    const r = deformedRadius(b, baseR, th, nbrs);
    pts[i] = [b.x + cos(th) * r, b.y + sin(th) * r];
  }

  // curveVertex with duplicated endpoints to close smoothly
  gbuf.beginShape();
  const pA = pts[n - 1];
  const pB = pts[0];
  const pC = pts[1];
  gbuf.curveVertex(pA[0], pA[1]);
  gbuf.curveVertex(pB[0], pB[1]);
  for (let i = 0; i < n; i++) gbuf.curveVertex(pts[i][0], pts[i][1]);
  gbuf.curveVertex(pC[0], pC[1]);
  gbuf.curveVertex(pA[0], pA[1]);
  gbuf.endShape(CLOSE);
}

// compute deformed radius at angle th for bubble b
function deformedRadius(b, baseR, th, nbrs) {
  const ux = cos(th),
    uy = sin(th);
  let dent = 0;

  for (let n of nbrs) {
    if (n === b) continue;
    const dx = n.x - b.x,
      dy = n.y - b.y;
    const d2 = dx * dx + dy * dy;
    const d = sqrt(d2) + 1e-6;

    // only if close enough to matter
    const maxReach = baseR + n.r + INFL_PAD;
    if (d > maxReach) continue;

    // only neighbors in front of this ray contribute
    const cosA = (dx * ux + dy * uy) / d; // [-1..1]
    if (cosA <= 0) continue;

    // how much we must shrink to keep the gap along this direction
    const needed = baseR + n.r + GAP - d;
    if (needed <= 0) continue;

    // localized (directional) influence
    const wDir = pow(cosA, DIR_EXP);

    // bias by relative size (bigger neighbor dents more)
    const sizeBias = n.r / (n.r + baseR);

    dent += needed * wDir * sizeBias;
  }

  const r = baseR - dent * PUSH_GAIN;
  return max(baseR * 0.25, r);
}

// ---- spawning (random, no enforced nesting) ----
function spawnBubble() {
  const rT = random(R_MIN, R_MAX);
  const x = random(-rT * 0.5, width + rT * 0.5);
  const y = random(-rT * 0.5, height + rT * 0.5);
  const g = random(GROWTH_MIN, GROWTH_MAX);

  bubbles.push({
    id: nextId++,
    x,
    y,
    rTarget: rT,
    r: 0.001,
    scale: 0.0,
    growth: g,
  });
}

// ---- spatial hash helpers ----
function resizeGrid() {
  gc = max(1, floor(width / cellSize));
  gr = max(1, floor(height / cellSize));
  grid = new Array(gc * gr);
  for (let i = 0; i < grid.length; i++) grid[i] = [];
}

function clearGrid() {
  for (let i = 0; i < grid.length; i++) grid[i].length = 0;
}

function binBubbles() {
  for (let b of bubbles) {
    const ci = constrain(floor(b.x / cellSize), 0, gc - 1);
    const cj = constrain(floor(b.y / cellSize), 0, gr - 1);
    grid[ci + cj * gc].push(b);
  }
}

function gatherNeighbors(b) {
  const ci = constrain(floor(b.x / cellSize), 0, gc - 1);
  const cj = constrain(floor(b.y / cellSize), 0, gr - 1);
  const res = [];
  for (let j = cj - 1; j <= cj + 1; j++) {
    if (j < 0 || j >= gr) continue;
    for (let i = ci - 1; i <= ci + 1; i++) {
      if (i < 0 || i >= gc) continue;
      const bin = grid[i + j * gc];
      for (let other of bin) res.push(other);
    }
  }
  return res;
}

// ---- collision/repulsion using the grid (unique pairs) ----
function resolveCollisionsGrid() {
  // process each bin neighborhood; push apart pairs that violate gap
  for (let j = 0; j < gr; j++) {
    for (let i = 0; i < gc; i++) {
      // collect candidates from 3×3 neighborhood
      const cand = [];
      for (let v = j - 1; v <= j + 1; v++) {
        if (v < 0 || v >= gr) continue;
        for (let u = i - 1; u <= i + 1; u++) {
          if (u < 0 || u >= gc) continue;
          cand.push(...grid[u + v * gc]);
        }
      }
      // unique pairs by id
      for (let aIdx = 0; aIdx < cand.length; aIdx++) {
        const a = cand[aIdx];
        for (let bIdx = aIdx + 1; bIdx < cand.length; bIdx++) {
          const b = cand[bIdx];
          if (a.id >= b.id) continue; // handle once

          const dx = b.x - a.x,
            dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          const minDist = a.r + b.r + GAP;

          if (d2 < minDist * minDist) {
            const d = sqrt(d2) || 0.001;
            const nx = dx / d,
              ny = dy / d;
            // split correction (0.5 each); use 0.25 for gentler glide
            const overlap = (minDist - d) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }
    }
  }
}

// ---- easing ----
function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}
function easeOutQuint(t) {
  return 1 - pow(1 - t, 5);
}

// ---- resize ----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(BG);

  gbuf = createGraphics(width * SSAA, height * SSAA);
  gbuf.pixelDensity(1);
  gbuf.strokeJoin(ROUND);
  gbuf.strokeCap(ROUND);

  resizeGrid();
}
