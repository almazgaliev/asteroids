//@ts-nocheck
import * as MyMath from "./math.js";

let rMin = 20;
let rMax = 40;
let rD = 8;


export {
  rMax,
  rMin
};

let speedMin = 40;
let speedMax = 80;
let n = 24;

let sizeToRadius = MyMath.getRemap(2, 0, rMin, rMax);

class Asteroid {
  constructor(hp, ix, pos, size = 0) {
    this.size = size;
    let n1 = n / (2 ** size);
    this.a = ix * n1;
    this.b = (ix + 1) * n1;
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
  let n1 = n / (2 ** size);
  for (let i = 0; i < n1; i++) {
    let phi = (i * 2 * Math.PI) / n1;
    let r = Math.random() * rD + sizeToRadius(size);
    res.push([Math.cos(phi) * r, -Math.sin(phi) * r, 1]);
  };
  return res;
}

export class AsteroidPool {
  constructor(width, height, amount) {
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

    this.sum = amount * n;
    this.free_space = 0;
    // if (sum - free_space == amount) then recreate one big asteroid

    this.asteroids = [];
    for (let ix = 0; ix < amount; ix++) {
      // let pos = [Math.random() * width, Math.random() * height];
      let a = new Asteroid(3, ix, [0, 0]);
      this.asteroids.push(a);
      for (let i = a.a; i < a.b; i++) {
        this.coords[0].push(MyMath.multiplyMV(a.moveMatrix, this._coords[0][i]));
      }
    }
  }

  addNew(size, pos) {
    let ix = this._coords[size].length * (2 ** size) / n; // FIX
    let a = new Asteroid(3 - size, ix, pos, size);
    this.asteroids.push(a);

    this._coords[size].push(...createAsteroidCoords(size));
    for (let i = a.a; i < a.b; i++) {
      this.coords[size].push(MyMath.multiplyMV(a.moveMatrix, this._coords[size][i]));
    }
  }

  update(interval, gameState) {
    for (const a of this.asteroids) {
      a.moveMid(interval, gameState);
      for (let i = a.a; i < a.b; i++) {
        this.coords[a.size][i] = MyMath.multiplyMV(a.moveMatrix, this._coords[a.size][i]);
      }
    }
  }
}
