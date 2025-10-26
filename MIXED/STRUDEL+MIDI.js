// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/

// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧ @title MDQ MIDI SETUP   ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧ @by Mario D. Quiroz  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸

// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

////////////////////// MIDI OUTPUT IMPLEMENTATION EXAMPLE ///////////////////
setcpm(120/2)
const PORT = 'IAC Driver Bus 1';
midiport(PORT);

const KEY = 'A'
const MODE = ':Phrygian'

////////////////////// STRUDEL CODE EXAMPLE ///////////////////

const CH = {
  BASS: 6,
  LEAD: 7,
  PAD: 8
};

const BASE = { latencyMs: 0, noteOffsetMs: 0 };
const M = ch => ({ ...BASE, midichannel: ch });

// EXECUTE IT ONLY FIRST CYCLE
// MIDICLOCK: midicmd("clock*48, start").midi('IAC Driver')

// EXECUTE ALWAYS AFTER FIRST CYCLE
MIDICLOCK: midicmd("clock*48").midi('IAC Driver')

// EXECUTE ONLY WHEN STOPPING
// MIDICLOCK: midicmd("clock*48, stop").midi('IAC Driver')

BASS: n("0 1 0 3 5 0 7 9")
  .scale(KEY + 2 + MODE)
  .fast(1)
  .midi(PORT, M(CH.BASS))
  // .midi(PORT, { latencyMs: 0, noteOffsetMs: 0, midichannel: CH.BASS})
  // .progNum(6) // COMMENT IT AND COMMET IT AGAIN TO ENABLE SOUND

LEAD: n("{5 ~ 5 ~ [5 7] ~ ~ [9 7]}%8")
  .scale(KEY + 3 + MODE)
  .midi(PORT, M(CH.LEAD))

PAD: 
  note(`<[0,4] [0,4]>`.add(`<0 1 3 4 5 6 7 8>`)
    .scale(KEY + 4 + MODE).slow(2)
  )
  .midi(PORT, M(CH.PAD))

