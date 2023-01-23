import * as MyMath from "./math.js";

export class StarField {
  constructor(amount, speedCoef, radius, width, height) {
    this.coords = [];
    this.speedCoef = speedCoef;
    this.radius = radius;
    for (let i = 0; i < amount; i++) {
      this.coords.push([Math.random() * width, Math.random() * height, 1]);
    }
    this.transformMatrix = MyMath.identityMatrix(3);
  }

  update(move, gameState) {
    this.transformMatrix = MyMath.moveMatrix(move);
    for (let i = 0; i < this.coords.length; i++) {
      this.coords[i] = MyMath.multiplyMV(this.transformMatrix, this.coords[i]); // сдвиг к позиции
      this.coords[i][0] = ((this.coords[i][0] + gameState.outBX / 2) % gameState.widthE + gameState.widthE) % gameState.widthE - gameState.outBX / 2;
      this.coords[i][1] = ((this.coords[i][1] + gameState.outBY / 2) % gameState.heightE + gameState.heightE) % gameState.heightE - gameState.outBY / 2;
    }
  }
}