//@ts-nocheck

import * as Draw from "./draw/draw.js";
import * as MyMath from "./math.js";

class StarField {
  constructor(amount) {
    this.stars = [];
    for (let i = 0; i < amount; i++) {
      this.stars.push([Math.random() * widthE, Math.random() * heightE, 1]);
    }
    this.transformMatrix = MyMath.identityMatrix(3);
  }

  update(move) {
    this.transformMatrix = MyMath.moveMatrix(move);
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i] = MyMath.multiplyMV(this.transformMatrix, this.stars[i]); // сдвиг к позиции
      this.stars[i][0] = ((this.stars[i][0] + outerBoundX / 2) % widthE + widthE) % widthE - outerBoundX / 2;
      this.stars[i][1] = ((this.stars[i][1] + outerBoundY / 2) % heightE + heightE) % heightE - outerBoundY / 2;
    }
  }
}

class Spaceship {
  /**
   * Создает космический корабль
   * @param {number[]} startPos вектор координат
   * @param {number} acceleration ускорение
   * @param {number} rotateSpeed скорость поворота
   * @param {number} maxSpeed максимальная скорость движения
   * @param {bool} movable должен ли игрок перемещаться по экрану
   */
  constructor(startPos, acceleration, rotateSpeed, maxSpeed, movable = false) {
    this.midPosition = [...startPos];
    this.moveMid = movable ? function (interval) {

      let speed = MyMath.multiplyVS(this.velocityNormal, this.currentSpeed); // speed

      // move mid
      this.midPosition[0] += speed[0] * interval;
      this.midPosition[1] += speed[1] * interval;

      // cycle mid coords when out of canvas borders
      this.midPosition[0] = ((this.midPosition[0] + outerBoundX / 2) % widthE + widthE) % widthE - outerBoundX / 2;
      this.midPosition[1] = ((this.midPosition[1] + outerBoundY / 2) % heightE + heightE) % heightE - outerBoundY / 2;
    } : () => { };

    this.acceleration = acceleration;
    this.rotateSpeed = rotateSpeed;
    this.maxSpeed = maxSpeed;
    this.speedRemap = MyMath.getLERP(1.6, 0.8);
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

  getTransformMatrix() {
    return MyMath.multiplyMM(
      MyMath.moveMatrix(this.midPosition),
      this.rotateMatrix,
    );
  };

  update(interval) {

    this.moveMid(interval);

    let transformMatrix = this.getTransformMatrix();
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

function keyDownListen(event) {
  switch (event.code) {
    case "KeyW":
      keyStates["KeyW"] = true;
      break;
    case "KeyA":
      keyStates["KeyA"] = true;
      keyStates["KeyD"] = false;
      break;
    case "KeyD":
      keyStates["KeyA"] = false;
      keyStates["KeyD"] = true;
      break;
  }
}

function keyUpListen(event) {
  switch (event.code) {
    case "KeyW":
    case "KeyA":
    case "KeyD":
      keyStates[event.code] = false;
      break;
  }
}

// main

function handleKey(player, interval) {
  if (keyStates["KeyA"])
    player.rotate(-player.rotateSpeed, interval);
  if (keyStates["KeyD"])
    player.rotate(player.rotateSpeed, interval);
  if (keyStates["KeyW"])
    player.accelerate(interval);
  if (keyStates["Space"]) {
    // this.shoot(); // TODO
  }
}

const outerBoundX = 40; // костыль чтобы не дублировать корабль при вылете за край
const outerBoundY = 40;

let width = document.body.clientWidth;
let height = 800;
let widthE = width + outerBoundX;
let heightE = height + outerBoundY;

const keyStates = {
  "KeyW": false,
  "KeyA": false,
  "KeyD": false,
  "Space": false,
};

function main() {
  let reverseByte = MyMath.getLERP(255, 0);
  let speedometrPos = [width - 40, height - 30];
  let speedometrA = 160;
  let speedometrB = 140;
  let player = new Spaceship([widthE / 2, heightE / 2], 300, 200, 800, true);
  let starField1 = new StarField(50);
  let starField2 = new StarField(200);

  let canvas = document.getElementById("main-canvas");
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);

  let ctx = canvas.getContext("2d");

  document.addEventListener("keypress", keyDownListen);
  document.addEventListener("keyup", keyUpListen);

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#fff";
  ctx.font = "24px Chakra Petch";

  let prevTimestamp;
  function drawFrame(timestamp = 0) {
    // интервал между кадрами в секундах
    let interval = ((timestamp - prevTimestamp) / 1000) || 0;
    prevTimestamp = timestamp;

    // обработать нажатия клавиш
    handleKey(player, interval);

    player.update(interval, keyStates);
    starField1.update(MyMath.multiplyVS(player.velocityNormal, -0.06 * player.currentSpeed * interval));
    starField2.update(MyMath.multiplyVS(player.velocityNormal, -0.04 * player.currentSpeed * interval));

    ctx.fillStyle = "#000";
    Draw.fillCanvas(ctx, canvas);
    ctx.fillStyle = "#fff";
    Draw.drawStars(ctx, starField1.stars, 1.2);
    Draw.drawStars(ctx, starField2.stars, 0.8);


    ctx.lineWidth = 3;
    Draw.strokePolygon(ctx, player.body);
    ctx.lineWidth = 1.5;

    ctx.fillStyle = "#000";
    Draw.fillPolygon(ctx, player.body);
    ctx.fillStyle = "#fff";



    if (keyStates["KeyW"]) {
      ctx.fillStyle = "#fff";
      Draw.fillPolygon(ctx, player.flame);
    }

    let speedF = player.speedF;

    // reverse green and blue to get "lerp" from white to red
    let greenBlue = Math.floor(reverseByte(speedF ** 3));
    ctx.fillStyle = `rgb(255, ${greenBlue}, ${greenBlue})`;

    Draw.drawSpeedometr(ctx, speedF, speedometrPos, speedometrA, speedometrB);

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

main();


// TODO add asteroids
// TODO add collisions
// TODO add shooting
// TODO add score
// TODO add aliens


// улучшение фпс
// двойная буферизация
// пул обьектов (переиспользование)

