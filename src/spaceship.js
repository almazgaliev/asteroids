import * as MyMath from "./math.js";

export class Spaceship {
  /**
   * Создает космический корабль
   * @param {number[]} startPos вектор координат
   * @param {number} acceleration ускорение
   * @param {number} rotateSpeed скорость поворота
   * @param {number} maxSpeed максимальная скорость движения
   * @param {number} shotsPerSec количество выстрелов в секунду
   * @param {boolean} movable должен ли игрок перемещаться по экрану
   */
  constructor(startPos, acceleration, rotateSpeed, maxSpeed, shotsPerSec = 3, movable = false) {
    this.moveMatrix = MyMath.moveMatrix(startPos);

    this.rechargeTime = 1 / shotsPerSec;
    this.currentRechargeTime = 0;

    this.moveMid = movable ? function (interval, gameState) {

      let speed = MyMath.multiplyVS(this.velocityNormal, this.currentSpeed); // speed

      // move mid
      this.midX += speed[0] * interval;
      this.midY += speed[1] * interval;

      // cycle mid coords when out of canvas borders
      this.midX = ((this.midX + gameState.outBX / 2) % gameState.widthE + gameState.widthE) % gameState.widthE - gameState.outBX / 2;
      this.midY = ((this.midY + gameState.outBY / 2) % gameState.heightE + gameState.heightE) % gameState.heightE - gameState.outBY / 2;
    } : () => { };

    this.acceleration = acceleration;
    this.rotateSpeed = rotateSpeed;
    this.maxSpeed = maxSpeed;
    this.bulletSpeed = maxSpeed * 2.5;
    this.speedRemap = MyMath.getLERP(0.8, 1.6);
    this.currentSpeed = 0;
    this.velocityNormal = [0, -1, 0];

    // варианты координат с нижним прочерком не должны изменяться
    this._flame = [
      [-5, 5, 1],
      [0, 18, 1],
      [5, 5, 1],
      [0, 0, 1]
    ];
    this.flame = [
      [-5, 5, 1],
      [0, 18, 1],
      [5, 5, 1],
      [0, 0, 1]
    ];

    // варианты координат с нижним прочерком не должны изменяться
    this._body = [
      [-15, 6, 1],
      [0, -27, 1],
      [15, 6, 1],
      [0, 0, 1]
    ];
    this.body = [
      [-15, 6, 1],
      [0, -27, 1],
      [15, 6, 1],
      [0, 0, 1]
    ];

    this.forwardVector = [0, -1, 0];
    this.angle = 0;
    this.rotateMatrix = MyMath.identityMatrix(3);
  }

  rotate(rotateSpeed, interval) {
    this.angle = ((this.angle + rotateSpeed * interval) % 360 + 360) % 360;
    this.rotateMatrix = MyMath.rotateMatrix(MyMath.degToRad(this.angle));
    this.forwardVector = MyMath.multiplyMV(this.rotateMatrix, [0, -1, 0]);
  }

  accelerate(interval) {
    // calculate speedDelta vector
    let deltaSpeed = MyMath.multiplyVS(this.forwardVector, this.acceleration * interval);

    // calculate velocity vector
    MyMath.multiplyVSMut(this.velocityNormal, this.currentSpeed);

    // calculate velocity vector
    MyMath.addMut(this.velocityNormal, deltaSpeed);

    // get new speed value
    this.currentSpeed = Math.min(MyMath.magnitude(this.velocityNormal), this.maxSpeed);

    // get new normalised velocity vector (only stores direction)
    MyMath.normalizeMut(this.velocityNormal);
  }

  get speedF() {
    return this.currentSpeed / this.maxSpeed;
  }

  get transformMatrix() {
    return MyMath.multiplyMM(
      this.moveMatrix,
      this.rotateMatrix,
    );
  };

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

  shoot() {
    if (this.currentRechargeTime <= 0) {
      this.currentRechargeTime = this.rechargeTime;

      // скорость корабля(вектор)
      let velocity = MyMath.multiplyVS(this.velocityNormal, this.currentSpeed);

      // скорость снаряда(вектор)
      MyMath.addMut(velocity, MyMath.multiplyVS(this.forwardVector, this.bulletSpeed));

      return { coord: [this.midX, this.midY], vector: velocity };
    }
  }

  update(interval, gameState) {
    this.currentRechargeTime -= this.currentRechargeTime > 0 ? interval : 0;

    this.moveMid(interval, gameState);

    let transformMatrix = this.transformMatrix;
    this.body = [];
    for (let i = 0; i < this._body.length; i++) {
      let coord = MyMath.multiplyMV(transformMatrix, this._body[i]); // сдвиг к позиции и поворот вокруг своей оси
      this.body.push(coord);
    }

    this.flame = [];
    let speedF = this.speedF;
    let flameTransformMatrix = MyMath.multiplyMM(transformMatrix, MyMath.scaleMatrix([1, this.speedRemap(speedF ** 3)])); // сделать пламя длиннее в заваисимости от скорости
    for (let i = 0; i < this._flame.length; i++) {
      let flame = MyMath.multiplyMV(flameTransformMatrix, this._flame[i]);
      this.flame.push(flame);
    }
  }
}
