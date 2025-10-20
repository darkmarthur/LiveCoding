// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// disintegration
// by Ritchse
// instagram.com/ritchse

osc(5, 0.1)
  .modulate(noise(6), 0.22)
  .diff(o0)
  .modulateScrollY(osc(2).modulate(osc().rotate(), 0.11))
  .scale(0.72)
  .color(0.99, 1.014, 1)
  .out();
