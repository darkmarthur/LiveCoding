// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/

// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧     @title MDQ MIDI LIB   ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧ @by Mario D. Quiroz  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸

// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

////////////////////// MIDI OUTPUT IMPLEMENTATION EXAMPLE ///////////////////
const PORT = 'IAC Driver Bus 1';
midiport(PORT);

const MIDI_LIB = await import('https://cdn.jsdelivr.net/gh/darkmarthur/LiveCoding@v1.1.4/utils/strudel-midi.mjs')
// Init WebMIDI (pick a port by name substring; or omit to use the first)
await MIDI_LIB.initMIDI({ nameMatch: PORT })   // e.g., 'IAC', 'USB', 'Bolsa', etc.

////////////////////// STRUDEL CODE EXAMPLE ///////////////////

const CH = {
  LEAD: 6,
};


MELODY: cat([
    n("0 1 0 3 5 0 7 9"),
    n("0 1 0 3 5 11 13 10")
  ])
  .scale('A2:Phrygian')
  .fast(1)
  .orbit(2)
  .tomidi(CH.LEAD, 1, 1)

