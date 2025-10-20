// "Follow Me"
// by Mario D. Quiroz
// https://www.instagram.com/mariodquiroz/


// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ STRUDEL  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸

const KEY = 'c';
const MODE = ' minor';

KICK: s("bd bd bd bd").bank("RolandTR909")
HIHAT: s("~ hh ~ hh ~ hh ~ hh")
  .velocity("[0 0.2 0.3 0.4]*4")
  .bank('RolandTR909')

BASS: 
  n("{~ 0 ~ 0 ~ <0 5> ~ <3 0>}%8")
    .scale(KEY + '2' + MODE)
    .sound("sawtooth")
    .attack(.1)
    .decay(.5)
    .release(0.1)
    .lpf(100, 4)
    // .hpf(50)
    // .lpenv(1).lpattack(0.3)
    .distort(3.0)

let PTN_LD = "3 4 5 [6 7]*2"
LEAD: n(PTN_LD)
  .scale(KEY + '3' + MODE).fast(2)
  .transpose(0)
  // ._pianoroll({ fold: 1, cycles: 8 })
  .sound("gm_electric_bass_finger")
  .lpf(1000)
  .release(perlin.range(0.2,1))

// ¸,ø¤º°°º¤ø,¸¸,ø¤º°°º¤ø,¸ ✧ ✦ ✧ P5 ✧ ✦ ✧ ¸,ø¤º°°º¤ø,¸¸,ø¤º°°º¤ø,¸
await import('https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js')

if (window.__p5inst) window.__p5inst.remove()
if (window.__p5cvs && window.__p5cvs.parentNode) window.__p5cvs.remove()

const host = getDrawContext().canvas
const cvs  = document.createElement('canvas')  // off-DOM (headless)
window.__p5cvs = cvs

function syncOffscreenCanvas() {
  const r = host.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(1, Math.round(r.width  * dpr))
  const h = Math.max(1, Math.round(r.height * dpr))
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w; cvs.height = h
    if (window.__p5inst) window.__p5inst.resizeCanvas(w, h)
  }
}

// --- Document-level pointer tracker (works even if p5 canvas is hidden)
const POINTER = { x: 0, y: 0, down: false, inside: false }
function updatePointer(e){
  const r = host.getBoundingClientRect()
  POINTER.inside =
    e.clientX >= r.left && e.clientX <= r.right &&
    e.clientY >= r.top  && e.clientY <= r.bottom
  const dpr = window.devicePixelRatio || 1
  POINTER.x = (e.clientX - r.left) * dpr
  POINTER.y = (e.clientY - r.top ) * dpr
}
addEventListener('pointermove',  updatePointer, { passive: true })
addEventListener('pointerdown', (e)=>{ updatePointer(e); POINTER.down = true  }, { passive: true })
addEventListener('pointerup',   (e)=>{ updatePointer(e); POINTER.down = false }, { passive: true })
addEventListener('scroll',       ()=> updatePointer({ clientX: POINTER._lx ?? 0, clientY: POINTER._ly ?? 0 }), { passive:true })
addEventListener('resize',       ()=> updatePointer({ clientX: POINTER._lx ?? 0, clientY: POINTER._ly ?? 0 }))

// tiny bio-inspired flow field + pointer interaction
const N = 600, SC = 0.002, ACC = 0.15, DAMP = 0.96
const MOUSE = { radius: 220, strength: 1, visc: 0.1, repulseOnClick: true }
let P = [], pmx = 0, pmy = 0

function sketch(p){
  let w,h
  p.setup = () => {
    syncOffscreenCanvas()
    p.pixelDensity(1)
    p.createCanvas(cvs.width, cvs.height, p.WEBGL, cvs)
    p.noStroke(); p.rectMode(p.CORNER)
    w=p.width; h=p.height
    P = Array.from({length:N}, () => ({
      x: p.random(-w/2, w/2), y: p.random(-h/2, h/2), vx:0, vy:0, r:p.random(1.5,3.5)
    }))
    pmx = POINTER.x; pmy = POINTER.y
  }

  p.draw = () => {
    syncOffscreenCanvas()
    w=p.width; h=p.height

    // subtle trail fade (fullscreen translucent quad)
    p.fill(0,18); p.resetMatrix(); p.rect(-w/2,-h/2,w,h)

    const t  = p.millis()*0.0002
    const mx = POINTER.x, my = POINTER.y
    const inBounds = POINTER.inside
    const cx = mx - w/2,   cy = my - h/2          // convert to WEBGL-centered coords
    const mvx = (mx - pmx) * MOUSE.visc, mvy = (my - pmy) * MOUSE.visc

    p.fill(255,190)
    for (const a of P){
      // Perlin flow
      const ang = p.noise((a.x+w/2)*SC,(a.y+h/2)*SC,t)*p.TAU*4 - p.PI
      a.vx = a.vx*DAMP + Math.cos(ang)*ACC
      a.vy = a.vy*DAMP + Math.sin(ang)*ACC

      // Pointer field (attract; hold to repel)
      if (inBounds){
        const dx = cx - a.x, dy = cy - a.y
        const dist = Math.hypot(dx, dy) || 1e-6
        if (dist < MOUSE.radius){
          const dir = (POINTER.down && MOUSE.repulseOnClick) ? -1 : 1
          const wgt = (1 - dist / MOUSE.radius)
          const nx = dx / dist, ny = dy / dist
          a.vx += (nx * MOUSE.strength * wgt) * dir + mvx * 0.02
          a.vy += (ny * MOUSE.strength * wgt) * dir + mvy * 0.02
        }
      }

      // integrate
      a.x += a.vx; a.y += a.vy

      // wrap
      if (a.x<-w/2) a.x=w/2; if (a.x>w/2) a.x=-w/2
      if (a.y<-h/2) a.y=h/2; if (a.y>h/2) a.y=-h/2

      p.circle(a.x,a.y,a.r*2)
    }

    pmx = mx; pmy = my
  }
}
window.__p5inst = new p5(sketch)
addEventListener('resize',  syncOffscreenCanvas)
addEventListener('scroll',  syncOffscreenCanvas, {passive:true})

// ¸,ø¤º°°º¤ø,¸¸,ø¤º°°º¤ø,¸ ✧ ✦ ✧ HYDRA ✧ ✦ ✧ ¸,ø¤º°°º¤ø,¸¸,ø¤º°°º¤ø,¸
await initHydra()

window.P5VIS = { on: 1 }
window.MIX   = { osc: 0.35 }

s0.init({ src: window.__p5inst.canvas })

// Simple OSC visual to blend over p5
const oscLayer =
  osc(12, 0.03, 0.3)
    .rotate(() => time * 0.5)
    .color(H(PTN_LD), 0.8, 0.5)
    .saturate(1.15)

// Pipeline: gate p5 → blend osc over it → out
src(s0)
  .blend(solid(0,0,0), () => 1 - window.P5VIS.on)
  .blend(oscLayer,     () => window.MIX.osc)
  .out(o0)
