import * as MyMath from "../math.js";
import {
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon
} from "./core.js";


function drawSpeedometer(ctx, speedF, speedometer) {
  // добавляем случайный эффект тряски на высоких скоростях
  let shakeX = Math.random() * speedF ** 3 * 6 - 3;
  let shakeY = Math.random() * speedF ** 3 * 6 - 3;
  let speedometrX = speedometer.pos[0] + shakeX;
  let speedometrY = speedometer.pos[1] + shakeY;

  // внутренний сектор
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    speedometer.r,
    MyMath.degToRad(speedometer.a),
    MyMath.degToRad(Math.random() * speedF ** 3 * 10 + speedometer.a + speedF * (speedometer.b - 10)) // так же добавляем тряску к стрелке спидометра
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.fill();

  // белая рамочка сектора
  ctx.beginPath();
  ctx.moveTo(speedometrX, speedometrY);
  ctx.arc(
    speedometrX,
    speedometrY,
    speedometer.r,
    MyMath.degToRad(speedometer.a),
    MyMath.degToRad(speedometer.a + speedometer.b)
  );
  ctx.lineTo(speedometrX, speedometrY);
  ctx.stroke();
}

function drawStars(ctx, coords, r) {
  for (let i = 0; i < coords.length; i++) {
    fillCircle(ctx, coords[i][0], coords[i][1], r);
  }
}

export default {
  drawSpeedometer,
  drawStars,
  fillCanvas,
  fillCircle,
  strokePolygon,
  fillPolygon,
};
