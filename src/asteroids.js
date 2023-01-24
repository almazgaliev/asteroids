//@ts-nocheck
import * as MyMath from "./math.js";

let rMin = 10;
let rMax = 30;

let dMin = 40;
let dMax = 80;
let n = 24;

class Asteroid {
  constructor(ix, pos, size = 0) {
    this.size = size;
    this.a = ix * n;
    this.b = (ix + 1) * n;
    this.hp = 3;

    let phi = Math.random() * 2 * Math.PI;
    this.currentSpeed = MyMath.multiplyVS([Math.cos(phi), -Math.sin(phi)], Math.random() * dMax + dMin);
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

  set midX(val) {
    this.moveMatrix[0][2] = val;
  }

  set midY(val) {
    this.moveMatrix[1][2] = val;
  }

}

function createAsteroidCoords() {
  let res = [];
  for (let i = 0; i < n; i++) {
    let phi = (i * 2 * Math.PI) / n;
    let r = Math.random() * rMin + rMax;
    res.push([Math.cos(phi) * r, -Math.sin(phi) * r, 1]);
  };
  return res;
}

export class AsteroidField {
  constructor(width, height, amount) {
    this._coords = [[], [], []];
    for (let ix = 0; ix < amount; ix++) {
      this._coords[0].push(...createAsteroidCoords());
    }
    this.coords = [[], [], []];

    this.sum = amount * n;
    this.free_space = 0;
    // if (sum - free_space == amount) then recreate one big asteroid

    this.asteroids = [];
    for (let ix = 0; ix < amount; ix++) {
      // let pos = [Math.random() * width, Math.random() * height];
      let a = new Asteroid(ix, [0, 0]);
      this.asteroids.push(a);
      for (let i = a.a; i < a.b; i++) {
        this.coords[0].push(MyMath.multiplyMV(a.moveMatrix, this._coords[0][i]));
      }
    }
  }

  update(interval, gameState) {
    for (const a of this.asteroids) {
      // let moveMatrix = MyMath.moveMatrix(MyMath.multiplyVS(a.currentSpeed, interval));
      // debugger;
      a.moveMid(interval, gameState);
      for (let i = a.a; i < a.b; i++) {
        // debugger;
        this.coords[a.size][i] = MyMath.multiplyMV(a.moveMatrix, this._coords[a.size][i]);
      }
    }
  }

  handleCollision(obj) {

  }
}
