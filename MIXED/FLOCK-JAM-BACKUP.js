// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧       JAM        ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ Mario D. Quiroz  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

////////////////////////////////////////////////////////////////////////////
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ MUSIC  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
////////////////////////////////////////////////////////////////////////////

// STRUDEL PLAY / UPDATE
// CTRL + ENTER
// STRUDEL STOP
// CTRL + .

const KEY = "c";
const MODE = " minor";

KICK: s("bd bd bd bd").bank("RolandTR909");
HIHAT: s("~ hh ~ hh ~ hh ~ hh")
  .velocity("[0 0.2 0.3 0.4]*4")
  .bank("RolandTR909");

BASS: n("{~ 0 ~ 0 ~ <0 5> ~ <3 0>}%8")
  .scale(KEY + "2" + MODE)
  ._pianoroll()
  .sound("sawtooth") // s̴̿̔̄͠ä̶́̉̍̏w̸̢͋̐̄ ̴̇͌͠͠w̵̍̽̊͐ȧ̶̻͔̣ve
  .attack(0.1)
  .decay(0.5)
  .release(0.1)
  .lpf(100, 4)
  // .hpf(50)
  // .lpenv(1).lpattack(0.3)
  .distort(3.0);

let PTN_LD = "3 4 5 [6 7]*2";
LEAD: n(PTN_LD)
  .scale(KEY + "3" + MODE)
  .fast(2)
  .transpose(0)
  ._pianoroll({ fold: 1, cycles: 8 })
  .sound("gm_electric_bass_finger")
  .lpf(1000)
  .release(0.4);

///////////////////////////////////////////////////////////////////&&/////////
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ VISUALS  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
///////////////////////////////////////////////////////////////////&&/////////

// HYDRA PLAY / UPDATE
// CTRL + SHIFT + ENTER
// HYDRA STOP
// CTRL + .

osc(107, 0, 0.7)
  .color(1, 0, 1)
  .rotate(0, -0.08)
  .modulateRotate(o1, 0.4)
  .out(o0);

osc(33)
  .rotate(2, 0.8)
  .modulateRotate(o0, () => a.fft[0] * 2)
  .out(o1);

//   $: n("0").scale("c2:minor").strans("<0 3 5 0>").s("supersaw:.6").euclidLegatoRot(1,16,0)
// .lpf(300).lpq(5)
// .spread(.5).dist("2:.5").lpe(0)

// $: s("riffin/2").fit().scrub(irand(16).div(16).seg(8)).almostNever(ply("2|4"))

// $: s("amen/4").fit().scrub(irand(16).div(16).seg(8)).almostNever(ply("2|4"))

// $: s("riffin/2").fit().scrub(irand(16).div(16).seg(8))
