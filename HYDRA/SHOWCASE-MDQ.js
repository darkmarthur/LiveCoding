// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ Conected Warrior  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ by Mario D. Quiroz ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz

osc(4, 0.1, 0.2).modulate(noise(3, 0.3)).luma(0.4, 0.2).out(o1);

src(o1)
  .rotate(() => Math.sin(time * 0.2) * 0.3)
  .pixelate(
    () => 50 + 30 * Math.sin(time * 0.5),
    () => 50 + 30 * Math.cos(time * 0.5)
  )
  .kaleid(() => 4 + Math.floor(Math.sin(time * 0.3) * 2))
  .out(o2);

src(o0)
  .scale(1.01)
  .blend(src(o2), 0.15)
  .contrast(1.2)
  .saturate(1.3)
  .colorama(() => 0.1 + 0.1 * Math.sin(time * 0.4))
  .out(o0);

// CTRL-Enter: run a line of code
// CTRL-Shift-Enter: run all code on screen
// ALT-Enter: run a block
// CTRL-Shift-H: hide or show code
// CTRL-Shift-F: format code using Prettier
// CTRL-Shift-S: Save screenshot and download as local file
// CTRL-Shift-G: Share to twitter (if available). Shares to @hydra_patterns
