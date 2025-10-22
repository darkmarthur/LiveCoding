// Licensed CC BY-NC-SA 4.0
// p5↔Strudel↔Hydra Bridge (headless p5, pointer tracking, sync, hot-swap)
// Usage: const boot = await import('https://cdn.jsdelivr.net/gh/<you>/<repo>@main/bridge.mjs');
//        const api  = await boot.mountP5({ webgl:true, setup, draw })

const P5_URL = "https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js";

const state = (window.__P5BOOT ||= {
  inst: null,
  cvs: null,
  host: null,
  pointer: { x: 0, y: 0, down: false, inside: false, dpr: 1 },
  setDraw: null,
  setSetup: null,
});

function ensureHost() {
  // Strudel host canvas if available; fallback to viewport
  const c =
    (typeof getDrawContext === "function" && getDrawContext()?.canvas) || null;
  if (!c)
    console.warn(
      "[bridge] getDrawContext().canvas not found; using viewport size fallback"
    );
  state.host = c;
}

function syncCanvas() {
  const dpr = window.devicePixelRatio || 1;
  state.pointer.dpr = dpr;
  if (!state.host) {
    ensureHost();
  }
  const r = state.host
    ? state.host.getBoundingClientRect()
    : { width: innerWidth, height: innerHeight };
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (!state.cvs) {
    state.cvs = document.createElement("canvas"); // headless (off-DOM)
  }
  if (state.cvs.width !== w || state.cvs.height !== h) {
    state.cvs.width = w;
    state.cvs.height = h;
    if (state.inst) state.inst.resizeCanvas(w, h);
  }
}

function installPointerListeners() {
  const upd = (e) => {
    if (!state.host) return;
    const r = state.host.getBoundingClientRect();
    const x = e.clientX ?? 0,
      y = e.clientY ?? 0;
    state.pointer.inside =
      x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
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

export async function mountP5(opts = {}) {
  const {
    webgl = true,
    pixelDensity = 1,
    setup = null, // (p, api) => void
    draw = null, // (p, api) => void
  } = opts;

  // load p5 if needed
  if (!window.p5) await import(P5_URL);

  // cleanup previous
  if (state.inst)
    try {
      state.inst.remove();
    } catch {}
  state.inst = null;
  state.cvs && (state.cvs = null);

  ensureHost();
  syncCanvas();
  installPointerListeners();

  // hot-swap handles
  state.setSetup = setup;
  state.setDraw = draw;

  // create p5 instance (rendering into off-DOM canvas)
  state.inst = new p5((p) => {
    p.setup = () => {
      syncCanvas();
      p.pixelDensity(pixelDensity);
      p.createCanvas(
        state.cvs.width,
        state.cvs.height,
        webgl ? p.WEBGL : undefined,
        state.cvs
      );
      if (webgl) p.rectMode(p.CORNER);
      p.noStroke();
      if (typeof state.setSetup === "function") state.setSetup(p, api());
    };
    p.draw = () => {
      syncCanvas();
      if (typeof state.setDraw === "function") state.setDraw(p, api());
    };
  });

  // public API for the user sketch
  function api() {
    const p = state.inst;
    return {
      p, // the p5 instance
      canvas: state.cvs, // off-DOM canvas
      pointer: state.pointer, // {x,y,down,inside,dpr}
      size: { w: p.width, h: p.height }, // convenience
      sync: syncCanvas, // call if you need manual sync
      setDraw(fn) {
        state.setDraw = fn;
      }, // hot-swap draw
      setSetup(fn) {
        state.setSetup = fn;
      }, // hot-swap setup
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

// Optional helper: hook p5 into Hydra and add a visibility/mix gate
export async function hydraGate({
  sourceIndex = 0,
  visVar = "P5VIS",
  mixOscVar = "MIX",
  osc = null,
} = {}) {
  // expects initHydra()/Hydra globals present in Strudel
  if (typeof initHydra === "function") await initHydra();
  const sName = "s" + sourceIndex;
  window[visVar] = window[visVar] || { on: 1 };
  window[mixOscVar] = window[mixOscVar] || { osc: 0 };

  // init Hydra source from p5 canvas
  window[sName].init({ src: state.inst?.canvas || state.cvs });

  // optional osc layer
  const oscLayer = osc
    ? osc
    : osc_(12, 0.03, 0.3)
        .rotate(() => time * 0.1)
        .color(1.2, 0.8, 0.5)
        .saturate(1.15);
  function osc_() {
    return osc.apply(null, arguments);
  } // allows passing osc(...) or use default

  src(window[sName])
    .blend(solid(0, 0, 0), () => 1 - window[visVar].on)
    .blend(oscLayer, () => window[mixOscVar].osc)
    .out(o0);

  return { visVar, mixOscVar, source: sName };
}
