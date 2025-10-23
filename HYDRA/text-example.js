await loadScript("https://h.6120.eu/hydra-text.js");

str = `cigarras de infinitos armónicos

entre las ramas,

pájaros-mosaico de colores
`;

text(str, "arial")
  .modulateScrollY(osc(2).modulate(osc().rotate(), 0.11))

  //  .modulate(noise(2, 4, 1, 3), -0.1)
  //  .rotate(0.5)

  .add(osc(10, 1, 1), 0.5)
  .scroll(0.003, 0.006)
  .out(o1);

src(s0)
  .thresh(() => time % 1)
  .modulate(noise(1), () => fft[1])
  .color(0, 0.1, 1)
  .hue(() => fft[1])
  .sub(src(o0).rotate(0.02))
  .modulate(
    osc(12, 0, 1.5).modulate(voronoi(6).sub(gradient()), 1).brightness(-0.5),
    0.003
  )

  .out(o0);
