// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//corrupted screensaver
//by Ritchse
//instagram.com/ritchse

voronoi(350, 0.15)
  .modulateScale(osc(8).rotate(Math.sin(time)), 0.5)
  .thresh(0.8)
  .modulateRotate(osc(7), 0.4)
  .thresh(0.7)
  .diff(src(o0).scale(1.8))
  .modulateScale(osc(2).modulateRotate(o0, 0.74))
  .diff(
    src(o0)
      .rotate([-0.012, 0.01, -0.002, 0])
      .scrollY(0, [-1 / 199800, 0].fast(0.7))
  )
  .brightness([-0.02, -0.17].smooth().fast(0.5))
  .out();
