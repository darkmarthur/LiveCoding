// Licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧     Raindrops      ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸ ✧ ✦ ✧ by Mario D. Quiroz ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸
//
// https://www.instagram.com/mariodquiroz/
// https://soundcloud.com/mario-quiroz
// https://link.me/mariodquiroz
//

let drops = [];

function setup() {
  createCanvas(600, 400);

  // Create initial drops
  for (let i = 0; i < 200; i++) {
    drops.push(new Drop());
  }
}

function draw() {
  background(20, 29, 58); // Dark sky

  for (let drop of drops) {
    drop.fall();
    drop.show();
  }
}

class Drop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-500, -50);
    this.z = random(0, 20);
    this.len = map(this.z, 0, 20, 10, 20);
    this.yspeed = map(this.z, 0, 20, 1, 20);
  }

  fall() {
    this.y += this.yspeed;
    this.yspeed += 0.2; // gravity

    // If it hits the ground
    if (this.y > height) {
      this.reset();
      this.yspeed = map(this.z, 0, 20, 1, 20);
    }
  }

  show() {
    let thick = map(this.z, 0, 20, 1, 3);
    strokeWeight(thick);
    stroke(138, 43, 226); // Purple-ish rain
    line(this.x, this.y, this.x, this.y + this.len);
  }
}
