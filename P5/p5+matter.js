// (っ◔◡◔)っ ♥  p5 + Matter.js • Colliding Cells with Gentle Flow + Mouse Drag
// Requirements loaded in your HTML before this file:
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

let Engine, World, Bodies, Body, Composite, Mouse, MouseConstraint;
let engine, world, mConstraint;
let cells = [];
let walls = [];

const COUNT = 40; // number of cells
const RMIN = 10,
  RMAX = 26;
const FLOW_SCALE = 0.0018; // noise scale for flow
const FLOW_FORCE = 0.00015; // magnitude of the flow force
const JITTER = 0.00005; // tiny random force
const FADE = 10; // trail fade
const COLS = [
  "#a7f3d0",
  "#6ee7b7",
  "#5eead4",
  "#22d3ee",
  "#60a5fa",
  "#f9c74f",
  "#f9844a",
  "#f8961e",
  "#f3722c",
  "#f94144",
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  background(8);

  // Pull Matter into locals
  ({ Engine, World, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter);

  engine = Engine.create();
  world = engine.world;

  // Zero gravity for “swimming” vibe
  world.gravity.y = 0;

  // Static walls (so bodies don’t leave screen)
  makeWalls();

  // Dynamic circle bodies (“cells”)
  for (let i = 0; i < COUNT; i++) {
    const r = random(RMIN, RMAX);
    const x = random(r + 40, width - r - 40);
    const y = random(r + 40, height - r - 40);
    const cell = Bodies.circle(x, y, r, {
      friction: 0.1,
      frictionAir: 0.03, // drag
      restitution: 0.2, // bounciness
      density: 0.0015, // mass density
      render: { fillStyle: random(COLS) },
    });
    // give a tiny initial nudge
    Body.setVelocity(cell, { x: random(-1, 1), y: random(-1, 1) });
    cells.push(cell);
  }
  World.add(world, cells);

  // Mouse drag (spring) on canvas
  const m = Mouse.create(canvas.elt);
  m.pixelRatio = pixelDensity(); // important for HiDPI
  mConstraint = MouseConstraint.create(engine, {
    mouse: m,
    constraint: {
      stiffness: 0.15,
      damping: 0.15,
    },
  });
  World.add(world, mConstraint);
}

function draw() {
  // trails
  fill(8, FADE);
  rect(0, 0, width, height);

  const t = frameCount * 0.002;

  // Apply gentle flow forces (same “field” idea, but as real forces)
  for (let b of cells) {
    const nx = b.position.x * FLOW_SCALE;
    const ny = b.position.y * FLOW_SCALE;
    const ang = noise(nx, ny, t) * TAU * 2.0;

    // flow direction + tiny jitter
    const fx = cos(ang) * FLOW_FORCE + (random() - 0.5) * JITTER;
    const fy = sin(ang) * FLOW_FORCE + (random() - 0.5) * JITTER;

    Body.applyForce(b, b.position, { x: fx, y: fy });
  }

  // Step physics
  Engine.update(engine, 1000 / 60);

  // Draw bodies with soft glow
  blendMode(HARD_LIGHT); // try ADD for brighter
  for (let b of cells) {
    const r = b.circleRadius;
    const c = color(b.render.fillStyle || "#ffffff");
    drawBlob(b.position.x, b.position.y, r, c);
  }
  blendMode(BLEND);

  // Optional: draw a faint line to the body being dragged
  if (mConstraint.body) {
    stroke(255, 100);
    strokeWeight(1);
    const p = mConstraint.body.position;
    line(p.x, p.y, mouseX, mouseY);
    noStroke();
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

function makeWalls() {
  // thin static walls slightly outside edges (so blobs collide, not get stuck)
  const thick = 40;
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  const floor = Bodies.rectangle(
    halfW,
    height + thick / 2,
    width + thick * 2,
    thick,
    { isStatic: true }
  );
  const ceil = Bodies.rectangle(halfW, -thick / 2, width + thick * 2, thick, {
    isStatic: true,
  });
  const left = Bodies.rectangle(-thick / 2, halfH, thick, height + thick * 2, {
    isStatic: true,
  });
  const right = Bodies.rectangle(
    width + thick / 2,
    halfH,
    thick,
    height + thick * 2,
    { isStatic: true }
  );

  walls = [floor, ceil, left, right];
  World.add(world, walls);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(8);

  // remove old walls, make new sized walls
  World.remove(world, walls);
  walls.length = 0;
  makeWalls();
}
