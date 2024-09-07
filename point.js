class Point {
  p = {}; // position
  v = { x: 0, y: 0 }; // velocity
  a = { x: 0, y: 0 }; // acceleration
  m = 0.01; // mass
  r; // radius

  constructor(x, y, r) {
    this.p = { x, y };
    this.r = r;
  }

  update(F, dt) {
    const scaleBy = 120; // compensate for 1 pixel = 1 metre
    let pNew = {
      x: this.p.x + this.v.x * dt + this.a.x * dt ** 2 * 0.5,
      y: this.p.y + this.v.y * dt + this.a.y * dt ** 2 * 0.5,
    };
    let aNew = {
      // scale by 100
      x: (scaleBy * F.x) / this.m,
      y: (scaleBy * F.y) / this.m,
    };
    let vNew = {
      x: this.v.x + (this.a.x + aNew.x) * (dt * 0.5),
      y: this.v.y + (this.a.y + aNew.y) * (dt * 0.5),
    };

    this.p = pNew;
    this.v = vNew;
    this.a = aNew;
  }

  set(x, y) {
    this.p.x = x;
    this.p.y = y;
  }
}

export { Point };
