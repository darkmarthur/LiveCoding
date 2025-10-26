// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧ Mario D. Quiroz ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸

// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

// Follow me on instagram or soundcloud if this code is useful for you

// Licensed CC BY-NC-SA 4.0
// utils/strudel-p5.mjs
// p5 ↔ Strudel ↔ Hydra bridge (off-DOM p5.Graphics, DPR sync, pointer tracking)
// Exports: mountP5, hydraGate
// v1.1.3

const P5_URL = "https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js";

const state = (window.__P5BOOT ||= {
  inst: null, // p5 instance
  g: null, // p5.Graphics offscreen render target
  host: null, // Strudel host canvas (if available)
  pointer: {
    x: 0,
    y: 0,
    down: false,
    inside: false,
    dpr: 1,
    _lx: null,
    _ly: null,
  },
});

async function waitForHostCanvas(timeoutMs = 2000) {
  const t0 = performance.now();
  while (performance.now() - t0 < timeoutMs) {
    try {
      if (typeof getDrawContext === "function") {
        const dc = getDrawContext();
        if (dc && dc.canvas) return dc.canvas;
      }
    } catch {}
    await new Promise((r) => requestAnimationFrame(r));
  }
  console.warn("[strudel-p5] No host canvas found; using viewport fallback");
  return null; // we’ll use viewport rect
}

async function ensureHost() {
  if (!state.host) state.host = await waitForHostCanvas();
}

function hostRect() {
  if (state.host) return state.host.getBoundingClientRect();
  // viewport fallback
  return {
    left: 0,
    top: 0,
    width: innerWidth,
    height: innerHeight,
    right: innerWidth,
    bottom: innerHeight,
  };
}

function syncSize() {
  const dpr = window.devicePixelRatio || 1;
  state.pointer.dpr = dpr;
  const r = hostRect();
  const W = Math.max(1, Math.round(r.width * dpr));
  const H = Math.max(1, Math.round(r.height * dpr));
  if (state.g && (state.g.width !== W || state.g.height !== H)) {
    state.g.resizeCanvas(W, H);
  }
}

function installPointer() {
  const upd = (e) => {
    const r = hostRect();
    const x = e.clientX ?? 0,
      y = e.clientY ?? 0;
    state.pointer.inside =
      x >= r.left &&
      x <= r.left + r.width &&
      y >= r.top &&
      y <= r.top + r.height;
    const dpr = state.pointer.dpr || 1;
    state.pointer.x = (x - r.left) * dpr;
    state.pointer.y = (y - r.top) * dpr;
    state.pointer._lx = x;
    state.pointer._ly = y;
  };
  addEventListener("pointermove", upd, { passive: true });
  addEventListener(
    "pointerdown",
    (e) => {
      upd(e);
      state.pointer.down = true;
    },
    { passive: true }
  );
  addEventListener(
    "pointerup",
    (e) => {
      upd(e);
      state.pointer.down = false;
    },
    { passive: true }
  );
  addEventListener(
    "scroll",
    () => {
      if (state.pointer._lx != null)
        upd({ clientX: state.pointer._lx, clientY: state.pointer._ly });
    },
    { passive: true }
  );
  addEventListener("resize", () => {
    if (state.pointer._lx != null)
      upd({ clientX: state.pointer._lx, clientY: state.pointer._ly });
  });
}

export async function mountP5({
  webgl = true,
  pixelDensity = 1,
  setup = null, // (p, api) => void   — use api.g for drawing
  draw = null, // (p, api) => void
} = {}) {
  if (!window.p5) await import(P5_URL);

  // cleanup previous
  try {
    state.inst?.remove();
  } catch {}
  state.inst = null;
  state.g = null;

  await ensureHost();
  installPointer();

  state.inst = new p5((p) => {
    p.setup = () => {
      // Create a tiny hidden main canvas (required by p5), but we won’t use it.
      const hidden = p.createCanvas(1, 1, p.P2D);
      hidden.canvas.style.display = "none";
      p.pixelDensity(pixelDensity);

      // Create our real offscreen render target as p5.Graphics
      const r = hostRect();
      const dpr = window.devicePixelRatio || 1;
      const W = Math.max(1, Math.round(r.width * dpr));
      const H = Math.max(1, Math.round(r.height * dpr));
      state.g = p.createGraphics(W, H, webgl ? p.WEBGL : p.P2D);
      if (webgl) state.g.rectMode(state.g.CORNER);
      state.g.noStroke();

      if (typeof setup === "function") setup(p, api());
    };

    p.draw = () => {
      syncSize(); // keep g in sync with host size/DPR
      if (typeof draw === "function") draw(p, api());
    };
  });

  function api() {
    const p = state.inst;
    const g = state.g;
    return {
      p,
      g, // <- draw HERE (p5.Graphics)
      canvas: g?.canvas || null, // Hydra can sample this
      pointer: state.pointer, // {x,y,down,inside,dpr}
      size: g ? { w: g.width, h: g.height } : { w: 0, h: 0 },
      sync: syncSize,
      setDraw(fn) {
        draw = fn;
      },
      setSetup(fn) {
        setup = fn;
      },
      destroy() {
        try {
          state.inst?.remove();
        } finally {
          state.inst = null;
          state.g = null;
        }
      },
    };
  }

  return api();
}

export async function hydraGate({
  sourceIndex = 0,
  visVar = "P5VIS",
  mixVar = "MIX",
  oscLayer = null,
} = {}) {
  if (typeof initHydra === "function") await initHydra();
  const sName = "s" + sourceIndex;
  window[visVar] = window[visVar] || { on: 1 };
  window[mixVar] = window[mixVar] || { osc: 0 };

  // Use the p5.Graphics canvas if present
  const srcCanvas = state.g?.canvas || null;
  if (!srcCanvas)
    console.warn("[strudel-p5] hydraGate: offscreen canvas not ready yet");

  window[sName].init({ src: srcCanvas });

  const layer =
    oscLayer ||
    osc(12, 0.03, 0.3)
      .rotate(() => time * 0.1)
      .color(1.2, 0.8, 0.5)
      .saturate(1.15);

  src(window[sName])
    .blend(solid(0, 0, 0), () => 1 - window[visVar].on)
    .blend(layer, () => window[mixVar].osc)
    .out(o0);

  return { source: sName, visVar, mixVar };
}
