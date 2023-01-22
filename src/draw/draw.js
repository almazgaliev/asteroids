import * as MyMath from "../math.js";
import {
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon
} from "./core.js";

function drawSpeedometr(ctx, speedF, speedometrPos, speedometrA, speedometrB) {

  // reverse green and blue to get "lerp" from white to red
  let greenBlue = Math.floor((255 - speedF ** 3 * 255)).toString(16);
  while (greenBlue.length < 2)
    greenBlue = '0' + greenBlue;

  ctx.fillStyle = "#ff" + greenBlue + greenBlue;

  // добавляем случайный эффект тряски на высоких скоростях
  let shakeX = Math.random() * speedF ** 3 * 10 - 5;
  let shakeY = Math.random() * speedF ** 3 * 10 - 5;
  let speedometrX = speedometrPos[0] + shakeX;
  let speedometrY = speedometrPos[1] + shakeY;

  // внутренний сектор
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    40,
    MyMath.degToRad(speedometrA),
    MyMath.degToRad(Math.random() * speedF * 15 + speedometrA + speedF * (speedometrB - 15)) // так же добавляем тряску к стрелке спидометра
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.fill();

  // белая рамочка сектора
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    40,
    MyMath.degToRad(speedometrA),
    MyMath.degToRad(speedometrA + speedometrB)
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.stroke();
}

module.exports = {
  drawSpeedometr,
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon,
};
