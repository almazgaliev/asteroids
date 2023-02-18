import * as MyMath from "../math.js";
import { fillCircle, strokePolygon, fillPolygon } from "./core.js";

export * from "./core.js";

let reverseByte = MyMath.getLERP(255, 0);

export function drawSpeedometer(ctx, speedF, speedometer) {
  // reverse green and blue to get "lerp" from white to red
  let greenBlue = Math.floor(reverseByte(speedF ** 3));
  let speedometerStyle = `rgb(255,${greenBlue},${greenBlue})`;
  ctx.strokeStyle = speedometerStyle;
  ctx.fillStyle = speedometerStyle;

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

export function drawStarField(ctx, starField) {
  ctx.fillStyle = "#fff";
  drawStars(ctx, starField.coords, starField.radius);
}


export function drawPlayer(ctx, player,stroke, gameState) {
  ctx.fillStyle = "#000";
  fillPolygon(ctx, player.body);

  ctx.strokeStyle = stroke;
  strokePolygon(ctx, player.body);


  if (gameState.keys["KeyW"]) {
    ctx.fillStyle = "#fff";
    fillPolygon(ctx, player.flame);
  }

}

// let colors = ["#0f0", "#f00"];
export function drawAsteroids(ctx, asteroids) {
  for (let a of asteroids.asteroids) {
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#fff";
    fillPolygon(ctx, asteroids.coords[a.size].slice(a.i, a.i + a.n));
    // ctx.strokeStyle = "#fff";
    // ctx.strokeStyle = colors[a.hp-1];
    strokePolygon(ctx, asteroids.coords[a.size].slice(a.i, a.i + a.n));
  }
}

export function drawBullet(ctx, coords) {
  ctx.fillStyle = "#00f";
  fillCircle(ctx, ...coords, 5);
}

export function drawScore(ctx, value, posX, posY) {
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Score: ${value}`, posX, posY);
}