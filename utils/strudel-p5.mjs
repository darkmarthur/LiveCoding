// utils/strudel-p5.mjs
// Licensed CC BY-NC-SA 4.0
// p5 ↔ Strudel ↔ Hydra bridge (headless p5, DPR sync, pointer tracking)
// Exports: mountP5, hydraGate

const P5_URL = "https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js";

const state = (window.__P5BOOT ||= {
  inst: null,
  cvs: null,
  host: null,
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
  return null;
}

async function ensureHost() {
  if (!state.host) state.host = await waitForHostCanvas();
}

function getHostRect() {
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

function ensureCanvas() {
  if (!state.cvs) state.cvs = document.createElement("canvas"); // off-DOM
  return state.cvs;
}

function syncCanvas() {
  const dpr = window.devicePixelRatio || 1;
  state.pointer.dpr = dpr;
  const r = getHostRect();
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  const cvs = ensureCanvas();
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w;
    cvs.height = h;
    if (state.inst) state.inst.resizeCanvas(w, h);
  }
}

function installPointer() {
  const upd = (e) => {
    const r = getHostRect();
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
  setup = null,
  draw = null,
} = {}) {
  if (!window.p5) await import(P5_URL);

  // cleanup previous
  try {
    state.inst?.remove();
  } catch {}
  state.inst = null;
  ensureCanvas();

  await ensureHost(); // ← wait for Strudel host if available
  syncCanvas();
  installPointer();

  state.inst = new p5((p) => {
    p.setup = () => {
      syncCanvas();
      p.pixelDensity(pixelDensity);
      const cvs = ensureCanvas();
      p.createCanvas(cvs.width, cvs.height, webgl ? p.WEBGL : undefined, cvs);
      if (webgl) p.rectMode(p.CORNER);
      p.noStroke();
      if (typeof setup === "function") setup(p, api());
    };
    p.draw = () => {
      syncCanvas();
      if (typeof draw === "function") draw(p, api());
    };
  });

  function api() {
    const p = state.inst;
    return {
      p,
      canvas: ensureCanvas(),
      pointer: state.pointer, // {x,y,down,inside,dpr}
      size: { w: p.width, h: p.height },
      sync: syncCanvas,
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

  // init Hydra source from p5 canvas
  window[sName].init({ src: state.inst?.canvas || state.cvs });

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
