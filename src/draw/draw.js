import * as MyMath from "../math.js";
import {
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon
} from "./core.js";


function drawSpeedometr(ctx, speedF, speedometrPos, speedometrA, speedometrB) {
  let r = 50;
  // добавляем случайный эффект тряски на высоких скоростях
  let shakeX = Math.random() * speedF ** 3 * 6 - 3;
  let shakeY = Math.random() * speedF ** 3 * 6 - 3;
  let speedometrX = speedometrPos[0] + shakeX;
  let speedometrY = speedometrPos[1] + shakeY;

  // внутренний сектор
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    r,
    MyMath.degToRad(speedometrA),
    MyMath.degToRad(Math.random() * speedF ** 3 * 10 + speedometrA + speedF * (speedometrB - 10)) // так же добавляем тряску к стрелке спидометра
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.fill();

  // белая рамочка сектора
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    r,
    MyMath.degToRad(speedometrA),
    MyMath.degToRad(speedometrA + speedometrB)
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.stroke();
}

function drawStars(ctx, coords, r) {
  // console.log("");
  for (let i = 0; i < coords.length; i++) {
    // console.log(coords[i]);
    fillCircle(ctx, coords[i][0], coords[i][1], r);
  }
}

export default {
  drawSpeedometr,
  drawStars,
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon,
};
