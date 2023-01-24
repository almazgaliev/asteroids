// @ts-nocheck

import * as Draw from "./draw/draw.js";
import * as MyMath from "./math.js";
import { Spaceship } from "./spaceship.js";
import { StarField } from "./stars.js";
import { AsteroidField } from "./asteroids.js";
import { Speedometer } from "./ui/speedometer.js";


function createKeyHandlers(gameState) {
  function keyDownListen(event) {
    switch (event.code) {
      case "KeyW":
        gameState.keys["KeyW"] = true;
        break;
      case "KeyA":
        gameState.keys["KeyA"] = true;
        gameState.keys["KeyD"] = false;
        break;
      case "KeyD":
        gameState.keys["KeyA"] = false;
        gameState.keys["KeyD"] = true;
        break;
    }
  }

  function keyUpListen(event) {
    switch (event.code) {
      case "KeyW":
      case "KeyA":
      case "KeyD":
        gameState.keys[event.code] = false;
        break;
    }
  }
  return [keyDownListen, keyUpListen];
}

// main

let globalGameState = {
  outBX: 60, // костыль чтобы не дублировать корабль при вылете за край
  outBY: 60,
  width: document.body.clientWidth,
  height: 800,
  get widthE() { return this.width + this.outBX; },
  get heightE() { return this.height + this.outBY; },
  keys: {
    "KeyW": false,
    "KeyA": false,
    "KeyD": false,
    "Space": false,
  },
  prevT: undefined,
  score: 0,
};

let widthE = globalGameState.widthE;
let heightE = globalGameState.heightE;

let reverseByte = MyMath.getLERP(255, 0);
let speedometer = new Speedometer([globalGameState.width - 40, globalGameState.height - 30], 160, 140);

let asteroids = new AsteroidField(widthE, heightE, 24);


let player = new Spaceship([widthE / 2, heightE / 2], 250, 150, 350, true);
let starFields = [
  new StarField(50, 0.5, 1.0, widthE, heightE), // 50000 is laggy on ff
  new StarField(150, 0.4, 0.8, widthE, heightE),
  new StarField(300, 0.3, 0.6, widthE, heightE)
];

let canvas = document.getElementById("main-canvas");
canvas.setAttribute("width", globalGameState.width);
canvas.setAttribute("height", globalGameState.height);

let ctx = canvas.getContext("2d");

let listeners = createKeyHandlers(globalGameState);
document.addEventListener("keypress", listeners[0]);
document.addEventListener("keyup", listeners[1]);

ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 1.5;
ctx.font = "24px Chakra Petch";

(function drawFrame(timestamp = 0) {
  // интервал между кадрами в секундах
  let interval = ((timestamp - globalGameState.prevT) * 0.001) || 0;
  globalGameState.prevT = timestamp;

  // update asteroids
  asteroids.update(interval, globalGameState);
  // update player
  player.update(interval, globalGameState);

  for (let i = 0; i < starFields.length; i++) {
    starFields[i].update(MyMath.multiplyVS(player.velocityNormal, -(starFields[i].speedCoef ** 3) * player.currentSpeed * interval), globalGameState);
  }

  // draw

  // draw background
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#000";
  Draw.fillCanvas(ctx, canvas);

  // draw stars
  ctx.fillStyle = "#fff";
  for (let i = 0; i < starFields.length; i++) {
    Draw.drawStars(ctx, starFields[i].coords, starFields[i].radius);
  }

  // draw asteroids

  for (let a of asteroids.asteroids) {
    ctx.fillStyle = "#000";
    Draw.fillPolygon(ctx, asteroids.coords[0].slice(a.a, a.b));
    ctx.fillStyle = "#fff";
    Draw.strokePolygon(ctx, asteroids.coords[0].slice(a.a, a.b));
  }

  // draw player

  ctx.fillStyle = "#000";
  Draw.fillPolygon(ctx, player.body);

  ctx.fillStyle = "#fff";
  Draw.strokePolygon(ctx, player.body);


  if (globalGameState.keys["KeyW"]) {
    ctx.fillStyle = "#fff";
    Draw.fillPolygon(ctx, player.flame);
  }

  // draw ui
  let speedF = player.speedF;

  // reverse green and blue to get "lerp" from white to red
  let greenBlue = Math.floor(reverseByte(speedF ** 3));
  let speedometerStyle = `rgb(255,${greenBlue},${greenBlue})`;
  ctx.strokeStyle = speedometerStyle;
  ctx.fillStyle = speedometerStyle;

  Draw.drawSpeedometer(ctx, speedF, speedometer);

  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";

  ctx.fillText(`Score: ${globalGameState.score}`, 20, 40);

  requestAnimationFrame(drawFrame);
})();


// TODO implement shooting
// TODO implement collisions
// TODO finish implementing asteroids
// TODO implement counting score
// TODO reimplement using ctx.translate ctx.rotate ctx.scale and use createPattern for stars
// TODO add aliens


// улучшение фпс
// двойная буферизация
// пул обьектов (переиспользование)
