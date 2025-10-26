// Licensed CC BY-NC-SA 4.0
// STRUDDEL MIDI / UTILS PACK
// - Random helpers
// - Giphy URL helper
// - Web MIDI bootstrap (choose output by name)
// - Strudel Pattern helpers: .tomidi(), .pgm()

// ----------------- RANDOM / MEDIA -----------------
export function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const giphyMp4 = (id) => `https://media.giphy.com/media/${id}/giphy.mp4`;

// ----------------- WEB MIDI CORE ------------------
const MIDI = {
  access: null,
  outputs: new Map(), // id -> MIDIOutput
  out: null,          // default output (MIDIOutput)
};

export async function initMIDI({ nameMatch = null } = {}) {
  if (!navigator.requestMIDIAccess) {
    console.warn('[struddle-midi] WebMIDI not supported in this browser.');
    return null;
  }
  MIDI.access = await navigator.requestMIDIAccess({ sysex: false });
  MIDI.outputs.clear();
  for (const output of MIDI.access.outputs.values()) {
    MIDI.outputs.set(output.id, output);
  }
  // Choose default output
  if (nameMatch) {
    setOutput(nameMatch);
  } else {
    MIDI.out = MIDI.outputs.values().next().value || null;
  }
  if (!MIDI.out) console.warn('[struddle-midi] No MIDI output selected.');
  return MIDI;
}

export function listOutputs() {
  return Array.from(MIDI.outputs.values()).map(o => ({ id: o.id, name: o.name, manufacturer: o.manufacturer }));
}

export function setOutput(match) {
  if (!MIDI.access) { console.warn('[struddle-midi] Call initMIDI() first.'); return null; }
  let out = null;
  if (typeof match === 'string') {
    // substring match on name
    out = Array.from(MIDI.outputs.values()).find(o => (o.name || '').toLowerCase().includes(match.toLowerCase())) || null;
  } else if (match instanceof RegExp) {
    out = Array.from(MIDI.outputs.values()).find(o => match.test(o.name || '')) || null;
  } else if (typeof match === 'function') {
    out = Array.from(MIDI.outputs.values()).find(match) || null;
  } else if (match && MIDI.outputs.has(match)) {
    out = MIDI.outputs.get(match);
  }
  MIDI.out = out || MIDI.out || null;
  if (!MIDI.out) console.warn('[struddle-midi] setOutput(): no match.');
  return MIDI.out;
}

// Low-level sends (for ad-hoc needs)
export function sendPC(chan = 0, program = 0) {
  if (!MIDI.out) { console.warn('[struddle-midi] No output.'); return; }
  // Accept 1–128 (user friendly) or 0–127 (raw)
  let p = Number(program);
  if (Number.isFinite(p)) { if (p >= 1 && p <= 128) p = p - 1; p = Math.max(0, Math.min(127, p)); } else return;
  const status = 0xC0 | (chan & 0x0F);
  MIDI.out.send([status, p]);
}
export function sendCC(chan = 0, cc = 1, value = 0) {
  if (!MIDI.out) { console.warn('[struddle-midi] No output.'); return; }
  const v = Math.max(0, Math.min(127, value|0));
  const status = 0xB0 | (chan & 0x0F);
  MIDI.out.send([status, cc & 0x7F, v]);
}
export function sendNoteOn(chan = 0, note = 60, vel = 100) {
  if (!MIDI.out) { console.warn('[struddle-midi] No output.'); return; }
  const status = 0x90 | (chan & 0x0F);
  MIDI.out.send([status, note & 0x7F, Math.max(0, Math.min(127, vel|0))]);
}
export function sendNoteOff(chan = 0, note = 60, vel = 64) {
  if (!MIDI.out) { console.warn('[struddle-midi] No output.'); return; }
  const status = 0x80 | (chan & 0x0F);
  MIDI.out.send([status, note & 0x7F, Math.max(0, Math.min(127, vel|0))]);
}

// ----------------- STRUDEL HELPERS ----------------
// Attach Pattern.prototype utilities if Strudel is present
export function installStrudelHelpers({ overwrite = false } = {}) {
  if (typeof Pattern === 'undefined') return false;

  // .tomidi(chan, velocity=0.8, length=0.25)
  if (overwrite || typeof Pattern.prototype.tomidi !== 'function') {
    try { if (Pattern.prototype.tomidi && overwrite) delete Pattern.prototype.tomidi; } catch {}
    Pattern.prototype.tomidi = function (chan, vel = 0.8, len = 0.25) {
      // Use Strudel’s own pipeline for scheduling & length
      return this.midichan(chan).midi({ velocity: vel, length: len });
    };
  }

  // .pgm(): send a Program Change around your pattern
  // Modes: 'prepend' (default), 'append', 'solo'
  if (overwrite || typeof Pattern.prototype.pgm !== 'function') {
    try { if (Pattern.prototype.pgm && overwrite) delete Pattern.prototype.pgm; } catch {}
    const _pcOnce = (chan, prog) => {
      let p = Number(prog);
      if (Number.isFinite(p)) {
        if (p >= 1 && p <= 128) p = p - 1; // 1-based → 0-based
        p = Math.max(0, Math.min(127, p));
      } else {
        console.warn('[pgm] Invalid program value:', prog);
        return null;
      }
      // Prefer Strudel's progNum helper if available; otherwise warn & no-op
      if (typeof progNum === 'function') {
        return progNum(p).midichan(Number(chan)).midi().take(1);
      } else {
        console.warn('[pgm] progNum() not found; cannot emit PC pattern in this environment.');
        return null;
      }
    };

    Pattern.prototype.pgm = function (a, b, c = {}) {
      // Overloads:
      //   .pgm(chan, prog, {mode})
      //   .pgm({chan, prog, mode})
      let chan, prog, mode = (c && c.mode) || 'prepend';
      if (typeof a === 'object' && a) { chan = a.chan; prog = a.prog; if (a.mode) mode = a.mode; }
      else { chan = a; prog = b; }

      const pc = _pcOnce(chan, prog);
      if (!pc) return this;

      if (mode === 'solo')   return pc;
      if (mode === 'append') return stack(this, pc);
      return stack(pc, this); // 'prepend'
    };
  }

  return true;
}

// Try to auto-install if Strudel is already in scope
try { installStrudelHelpers({ overwrite: false }); } catch {}
