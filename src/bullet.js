import * as MyMath from "./math.js";

export class BulletPool {
  /**
   * Создает пустой пул снарядов
   */
  constructor() {
    this.positions = [];
    this.vectors = [];
    // this.emptys
    this.amount = 0;
  }

  push(coord, vector) {
    this.positions.push(coord);
    this.vectors.push(vector);
    this.amount++;
  }

  remove(id) {
    this.positions.splice(id, 1);
    this.vectors.splice(id, 1);
    this.amount--;
  }

  update(interval, gameState) {
    for (let i = 0; i < this.positions.length; i++)
      MyMath.addMut(this.positions[i], MyMath.multiplyVS(this.vectors[i], interval));
    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i][0] < -gameState.outBX || this.positions[i][0] > gameState.widthE ||
        this.positions[i][1] < -gameState.outBY || this.positions[i][1] > gameState.heightE) {
        this.remove(i--);
      }
    }

  }

  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        if (i < this.amount) {
          return { done: false, value: { id: i, coords: this.positions[i++] } };
        }
        else
          return { done: true };
      }
    };
  }
}