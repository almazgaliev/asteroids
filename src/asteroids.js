//@ts-nocheck
import * as MyMath from "./math.js";

var rMin = 20;
var rMax = 40;
var rD = 8;
var speedMin = 40;
var speedMax = 80;
var maxPointAmount = 28;
var sizeToRadius = MyMath.getRemap(2, 0, rMin, rMax);

export {
  rMax,
  rMin,
};



class Asteroid {
  constructor(hp, ix, pos, size = 0) {
    this.size = size;
    this.n = maxPointAmount / (2 ** size);
    this.i = ix;
    this.hp = hp;
    let phi = Math.random() * 2 * Math.PI;
    this.currentSpeed = MyMath.multiplyVS([Math.cos(phi), -Math.sin(phi)], Math.random() * speedMax + speedMin);
    this.moveMatrix = MyMath.moveMatrix(pos);
  }

  moveMid(interval, gameState) {
    // move mid
    this.midX += this.currentSpeed[0] * interval;
    this.midY += this.currentSpeed[1] * interval;

    // cycle mid coords when out of canvas borders
    this.midX = ((this.midX + gameState.outBX / 2) % gameState.widthE + gameState.widthE) % gameState.widthE - gameState.outBX / 2;
    this.midY = ((this.midY + gameState.outBY / 2) % gameState.heightE + gameState.heightE) % gameState.heightE - gameState.outBY / 2;
  }
  get midX() {
    return this.moveMatrix[0][2];
  }

  get midY() {
    return this.moveMatrix[1][2];
  }

  get pos() {
    return [this.moveMatrix[0][2], this.moveMatrix[1][2]];
  }

  set midX(val) {
    this.moveMatrix[0][2] = val;
  }

  set midY(val) {
    this.moveMatrix[1][2] = val;
  }

}

function createAsteroidCoords(size = 0) {
  let res = [];
  let n1 = maxPointAmount / (2 ** size);
  for (let i = 0; i < n1; i++) {
    let phi = (i * 2 * Math.PI) / n1;
    let r = Math.random() * rD + sizeToRadius(size);
    res.push([Math.cos(phi) * r, -Math.sin(phi) * r, 1]);
  };
  return res;
}

export class AsteroidPool {
  constructor(width, height, amount) {
    this.width = width;
    this.height = height;
    this._coords = [
      [], // big asteroids
      [], // medium asteroids
      []  // small asteroids
    ];
    this.coords = [
      [],
      [],
      []
    ];

    for (let ix = 0; ix < amount; ix++) {
      this._coords[0].push(...createAsteroidCoords());
    }

    this.free_space = { sum: 0, indexes: [[], [], []] };
    this.asteroids = [];
    for (let ix = 0; ix < amount; ix++) {
      // let pos = [Math.random() * width, Math.random() * height];
      let a = new Asteroid(3, ix * maxPointAmount, [0, 0]);
      this.asteroids.push(a);
      for (let i = a.i; i < a.i + a.n; i++) {
        this.coords[0].push(MyMath.multiplyMV(a.moveMatrix, this._coords[0][i]));
      }
    }
  }

  addNew(size, pos) {
    let start = this.free_space.indexes[size]?.pop();
    let coords = createAsteroidCoords(size);
    let ix;
    if (start === undefined) {
      ix = this._coords[size].length;
      this._coords[size].push(...coords);
    }
    else {
      ix = start;
      for (let i = start, j = 0; i < start + maxPointAmount / (2 ** size); i++, j++) {
        this._coords[size][i] = coords[j];
      }
    }
    let a = new Asteroid(3 - size, ix, pos, size);
    
    this.free_space.sum -= a.n;
    this.asteroids.push(a);

  }

  shatter(a) {
    if (this.free_space.indexes[a.size].includes(a.i))
      debugger;
    this.free_space.indexes[a.size].push(a.i);
    this.free_space.sum += a.n;
    for (let i = a.i; i < a.i + a.n; i++) {
      delete this._coords[a.size][i];
    }

    if (a.size != 2) {
      let p = a.pos;
      this.addNew(a.size + 1, p);
      this.addNew(a.size + 1, p);
    }

    if (this.free_space.sum == maxPointAmount) {
      // let pos = [Math.random() * this.width, Math.random() * this.height];
      // this.addNew(0, pos, this.free_space.indexes[0]);
      this.addNew(0, [0, 0]);
    }
  }

  update(interval, gameState) {
    for (const a of this.asteroids) {
      a.moveMid(interval, gameState);
      for (let i = a.i; i < a.i + a.n; i++) {
        this.coords[a.size][i] = MyMath.multiplyMV(a.moveMatrix, this._coords[a.size][i]);
      }
    }
  }
}
