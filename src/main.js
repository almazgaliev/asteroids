//@ts-nocheck

import * as Draw from "./draw/draw.js";
import * as MyMath from "./math.js";

class Player {
  constructor(startPos, acceleration, rotateSpeed, maxSpeed) {
    this.midPosition = [...startPos];

    this.acceleration = acceleration;
    this.rotateSpeed = rotateSpeed;
    this.maxSpeed = maxSpeed;

    this.currentSpeed = 0;
    this.velocityNormal = [0, -1, 0];

    // варианты координат с нижним прочерком не должны изменяться
    this._flame = [[-5, 11, 1], [0, 24, 1], [5, 11, 1], [0, 6, 1]];
    this.flame = [[-5, 11, 1], [0, 24, 1], [5, 11, 1], [0, 6, 1]];

    // варианты координат с нижним прочерком не должны изменяться
    this._body = [[-15, 12, 1], [0, -21, 1], [15, 12, 1], [0, 6, 1]];
    this.body = [[-15, 12, 1], [0, -21, 1], [15, 12, 1], [0, 6, 1]];

    this.forwardVector = [0, -1, 0];
    this.angle = 0;
    this.rotateMatrix = MyMath.identityMatrix(3);
  }

  rotate(rotateSpeed, interval) {
    this.angle = ((this.angle + rotateSpeed * interval) % 360 + 360) % 360;
    this.rotateMatrix = MyMath.rotateMatrix(MyMath.degToRad(this.angle));
    this.forwardVector = MyMath.multiplyMV(this.rotateMatrix, [0, -1, 0]);
  }

  accelerate(amount, interval) {
    // calculate speedDelta vector
    let deltaSpeed = MyMath.mul(this.forwardVector, amount * interval);

    // calculate velocity vector
    MyMath.mulMut(this.velocityNormal, this.currentSpeed);

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

  update(interval, keyStates) {
    if (keyStates["KeyA"])
      this.rotate(-this.rotateSpeed, interval);
    if (keyStates["KeyD"])
      this.rotate(this.rotateSpeed, interval);
    if (keyStates["KeyW"])
      this.accelerate(this.acceleration, interval);
    if (keyStates["Space"]) {
      // this.shoot(); // TODO
    }

    let speed = MyMath.mul(this.velocityNormal, this.currentSpeed); // speed

    // move mid
    this.midPosition[0] += speed[0] * interval;
    this.midPosition[1] += speed[1] * interval;

    // cycle mid coords when out of canvas borders
    this.midPosition[0] = ((this.midPosition[0] + outerBoundX / 2) % widthE + widthE) % widthE - outerBoundX / 2;
    this.midPosition[1] = ((this.midPosition[1] + outerBoundY / 2) % heightE + heightE) % heightE - outerBoundY / 2;

    let transformMatrix = this.getTransformMatrix();
    this.body = [];
    for (let i = 0; i < this._body.length; i++) {
      let coord = MyMath.multiplyMV(transformMatrix, this._body[i]); // поворот вокруг своей оси
      // coord[0] += this.midPosition[0]; // сдвиг по X
      // coord[1] += this.midPosition[1]; // сдвиг по Y
      this.body.push(coord);
    }

    this.flame = [];
    for (let i = 0; i < this._flame.length; i++) {
      let flame = MyMath.multiplyMV(transformMatrix, this._flame[i]); // поворот вокруг своей оси
      // flame[0] += this.midPosition[0]; // сдвиг по X 
      // flame[1] += this.midPosition[1]; // сдвиг по Y
      this.flame.push(flame);
    }
  }
}

function handleKeyDown(event) {
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
    // default:
    //   console.log(`Unhandled Key: ${event.code}`);
  }
}


function handleKeyUp(event) {
  switch (event.code) {
    case "KeyW":
    case "KeyA":
    case "KeyD":
      keyStates[event.code] = false;
      break;
  }
}

// main

const outerBoundX = 40; // костыль чтобы не дублировать корабль при вылете за край
const outerBoundY = 40;

let width = document.body.clientWidth;
let height = 800;
let speedometrPos = [width - 30, height - 30];
let speedometrA = 150;
let speedometrB = 140;


let widthE = width + outerBoundX;
let heightE = height + outerBoundY;

const keyStates = {
  "KeyW": false,
  "KeyA": false,
  "KeyD": false,
  "Space": false,
};


let canvas = document.getElementById("main-canvas");

(function resizeCanvas() {
  width = document.body.clientWidth;
  height = 800;

  speedometrPos = [width - 30, height - 30];

  widthE = width + outerBoundX;
  heightE = height + outerBoundY;

  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
})();

let ctx = canvas.getContext("2d");
document.addEventListener("keypress", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);


(function main() {
  let player = new Player([widthE / 2, heightE / 2], 220, 250, 500);

  let prevTimestamp;
  function drawFrame(timestamp = 0) {
    // интервал между кадрами в секундах
    let interval = ((timestamp - prevTimestamp) / 1000) || 0;
    player.update(interval, keyStates);

    ctx.fillStyle = "#000";
    Draw.fillCanvas(ctx, canvas);

    ctx.lineCap = 'round';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#fff";
    Draw.strokePolygon(ctx, player.body);

    if (keyStates["KeyW"]) {
      ctx.fillStyle = "#fff";
      Draw.fillPolygon(ctx, player.flame);
    }
    Draw.drawSpeedometr(ctx, player.speedF, speedometrPos, speedometrA, speedometrB);

    prevTimestamp = timestamp;
    requestAnimationFrame(drawFrame);
  }
  drawFrame();
})();


// улучшение фпс
// двойная буферизация
// пул обьектов (переиспользование)

