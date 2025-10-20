// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧     Followme    ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ by Mario D. Quiroz ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz
//

let particles = [];
const N = 900; // number of dots
const SCALE = 0.0016; // noise scale (smaller = smoother flow)
const SPEED = 1.6; // particle speed
const FADE = 14; // trail fade each frame (0 = no fade, 255 = full clear)

// Palette: Night Pastel
const PAL = ["#e6e6e6", "#a3c9f9", "#ffb4a2", "#84dcc6"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  background(12);
  initParticles();
}

function draw() {
  // fade trails
  fill(12, FADE); // translucent dark overlay
  rect(0, 0, width, height);

  const t = frameCount * 0.0025;
  for (let p of particles) {
    // angle from 3D noise field
    const a = noise(p.x * SCALE, p.y * SCALE, t) * TAU * 2.0;
    p.vx = cos(a) * SPEED;
    p.vy = sin(a) * SPEED;

    p.x += p.vx;
    p.y += p.vy;

    // draw
    fill(p.c.r, p.c.g, p.c.b, 170);
    circle(p.x, p.y, p.r);

    // wrap edges softly
    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(12);
  initParticles();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < N; i++) {
    const col = color(random(PAL));
    particles.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      r: random(1.5, 3.8),
      c: { r: red(col), g: green(col), b: blue(col) },
    });
  }
}

// Optional: paint with mouse (kept super simple)
function mouseDragged() {
  for (let i = 0; i < 22; i++) {
    const a = random(TAU),
      d = random(2, 24);
    const col = color(random(PAL));
    fill(red(col), green(col), blue(col), 180);
    circle(mouseX + cos(a) * d, mouseY + sin(a) * d, random(2, 6));
  }
}
