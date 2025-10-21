// p5.js • Swarm Cells (germ‑like flow field)
// Single visualization • no keybindings • auto‑resize
// Agents drift through a noise flow field and render as soft, merging blobs.

let agents = [];
const COUNT = 320; // number of cells
const SPEED = 1.4; // base speed
const NOISE_SCALE = 0.0018; // flow field scale (smaller = smoother)
const JITTER = 0.35; // random wobble
const RADIUS = [8, 26]; // visual radius range for cells
const FADE = 10; // trail fade (0 = heavy trails, 255 = clear)

// Bio palette (cool) — tweak for different moods
const COLS = ["#a7f3d0", "#6ee7b7", "#5eead4", "#22d3ee", "#60a5fa"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  background(8);
  initAgents();
}

function draw() {
  // fade trails to keep motion memory
  fill(8, FADE);
  rect(0, 0, width, height);

  const t = frameCount * 0.002;
  blendMode(ADD); // additive to make blobs merge and glow

  for (let a of agents) {
    // Flow angle from noise
    const angle = noise(a.x * NOISE_SCALE, a.y * NOISE_SCALE, t) * TAU * 2.0;
    a.vx += cos(angle) * 0.06; // steer gently
    a.vy += sin(angle) * 0.06;

    // tiny random jitter to avoid grid locking
    a.vx += (random() - 0.5) * JITTER * 0.02;
    a.vy += (random() - 0.5) * JITTER * 0.02;

    // soft separation (avoid perfect overlaps)
    let fx = 0,
      fy = 0;
    for (let n of a.nbrs) {
      const dx = a.x - n.x,
        dy = a.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 === 0) continue;
      const minD = (a.r + n.r) * 0.6; // desired spacing
      if (d2 < minD * minD) {
        const inv = 1.0 / sqrt(d2);
        fx += dx * inv * 0.03; // push away lightly
        fy += dy * inv * 0.03;
      }
    }
    a.vx += fx;
    a.vy += fy;

    // speed clamp
    const sp = sqrt(a.vx * a.vx + a.vy * a.vy) + 1e-6;
    const maxSp = SPEED * map(a.r, RADIUS[0], RADIUS[1], 1.2, 0.7);
    a.vx = (a.vx / sp) * maxSp;
    a.vy = (a.vy / sp) * maxSp;

    // integrate
    a.x += a.vx;
    a.y += a.vy;

    // wrap edges softly
    if (a.x < -a.r) a.x = width + a.r;
    if (a.x > width + a.r) a.x = -a.r;
    if (a.y < -a.r) a.y = height + a.r;
    if (a.y > height + a.r) a.y = -a.r;

    // draw as soft radial blob
    drawBlob(a.x, a.y, a.r, a.c);
  }

  blendMode(BLEND);

  // update neighbor lists cheaply (gridless, partial shuffle)
  if (frameCount % 6 === 0) refreshNeighbors();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(8);
  initAgents();
}

function initAgents() {
  agents = [];
  for (let i = 0; i < COUNT; i++) {
    const c = color(random(COLS));
    agents.push({
      x: random(width),
      y: random(height),
      vx: random(-1, 1),
      vy: random(-1, 1),
      r: random(RADIUS[0], RADIUS[1]),
      c: { r: red(c), g: green(c), b: blue(c) },
      nbrs: [],
    });
  }
  refreshNeighbors();
}

function refreshNeighbors() {
  // Pick a few nearby neighbors per agent using simple k-NN (k≈5)
  const k = 5;
  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const dists = [];
    for (let j = 0; j < agents.length; j++)
      if (i !== j) {
        const b = agents[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        dists.push({ b, d2 });
      }
    dists.sort((u, v) => u.d2 - v.d2);
    a.nbrs = dists.slice(0, k).map((o) => o.b);
  }
}

function drawBlob(cx, cy, r, col) {
  // Draw 3 concentric circles with decreasing alpha to mimic a soft kernel
  const steps = 3;
  for (let i = steps; i >= 1; i--) {
    const rr = r * (i / steps);
    const a = 22 * i; // alpha ramp
    fill(col.r, col.g, col.b, a);
    circle(cx, cy, rr * 2);
  }
}

// Optional: gentle attraction to mouse when pressed
function mouseIsPressed() {
  return mouseIsPressed === true;
}
function mouseDragged() {
  for (let a of agents) {
    const dx = mouseX - a.x,
      dy = mouseY - a.y;
    const d = sqrt(dx * dx + dy * dy) + 1e-6;
    const pull = 0.02 * (1 - constrain(d / 180, 0, 1));
    a.vx += (dx / d) * pull;
    a.vy += (dy / d) * pull;
  }
}
