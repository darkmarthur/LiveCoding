// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧    SIMPLE BLISS  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ Mario D. Quiroz  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ STRUDEL  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸

setcpm(120 / 4);
const PTN_BD = "bd:8*4";
const PTN_BEAT = "{30 50 30 50}%8";
const PTN_BEAT2 = "{.25 .28 .25 .28}%8";
KICK: s(PTN_BD).bank("tr505").dist(2).lpf(1500).duck(2);
// .gain(1)
HIHAT: s("~ hh ~ hh ~ hh ~ hh").bank("tr909");

PIANO: n("[7,2,4]".add("<0 0 4 3>"))
  .scale("D3:minor")
  .s("piano")
  .room(0.5)
  .slow(2)
  .shape(0.5)
  .hpf(200)
  .off(
    0,
    (x) => x.arp("0 0 1 3").add(note(12)).ply("<1 2 [1 3]>")
    // .palindrome()
  )
  .lpf(2000)
  .gain(0.5);

// .arp("0 0 1 2")

BASS: n("[0 9 4] 0")
  .scale("G1:minor")
  // .scale("<G2:minor D1:minor>/2")
  .room(0.9)
  .s("sawtooth")
  .lpf(1500)
  .dist(1)
  .orbit(2)
  .off(0.5, (x) => x.strans(5).decay(0.3))
  .duckattack(0.1);

// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ HYDRA  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
await initHydra();

const LAYER_FEEDACK = () =>
  src(o0)
    // .scale(1.1)
    // .scroll(.003,.006)
    .modulate(
      osc(12, 0, 1.5).modulate(voronoi(6).sub(gradient()), 1).brightness(-0.5),
      0.003
    )
    .layer(osc(H(PTN_BEAT), 0.1, 1.5).mask(shape(200, H(PTN_BEAT2), 0.01)));

solid(0, 0, 0).add(LAYER_FEEDACK(), 1).out(o0);
