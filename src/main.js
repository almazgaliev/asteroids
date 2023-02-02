// @ts-nocheck

import * as Draw from "./draw/draw.js";
import * as MyMath from "./math.js";
import { Spaceship } from "./spaceship.js";
import { StarField } from "./stars.js";
import { AsteroidPool } from "./asteroids.js";
import { BulletPool } from "./bullet.js";
import { Speedometer } from "./ui/speedometer.js";


function createKeyHandlers(gameState) {
  function keyDownListen(event) {
    switch (event.code) {
      case "KeyW":
      case "KeyL":
        gameState.keys[event.code] = true;
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
      case "KeyL":
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
    "KeyL": false,
  },
  prevT: undefined,
  score: 0,
};

let widthE = globalGameState.widthE;
let heightE = globalGameState.heightE;

let speedometer = new Speedometer([globalGameState.width - 40, globalGameState.height - 30], 160, 140);

let asteroids = new AsteroidPool(widthE, heightE, 24);

let bullets = new BulletPool();

let player = new Spaceship([widthE / 2, heightE / 2], 250, 200, 300, 5, true);

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

  // handle keys
  if (globalGameState.keys["KeyA"])
    player.rotate(-player.rotateSpeed, interval);
  if (globalGameState.keys["KeyD"])
    player.rotate(player.rotateSpeed, interval);
  if (globalGameState.keys["KeyW"])
    player.accelerate(interval);
  if (globalGameState.keys["KeyL"]) {
    let a = player.shoot();
    if (a !== undefined)
      bullets.push(a.coord, a.vector);
  }

  // update asteroids
  asteroids.update(interval, globalGameState);

  // update player
  player.update(interval, globalGameState);

  bullets.update(interval, globalGameState);

  for (let i = 0; i < starFields.length; i++) {
    starFields[i].update(MyMath.multiplyVS(player.velocityNormal, -(starFields[i].speedCoef ** 3) * player.currentSpeed * interval), globalGameState);
  }

  // draw

  // draw background
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#000";
  Draw.fillCanvas(ctx, canvas);

  // draw stars
  for (let i = 0; i < starFields.length; i++) {
    Draw.drawStarField(ctx, starFields[i]);
  }

  Draw.drawAsteroids(ctx, asteroids);

  for (const bullet of bullets) {
    Draw.drawBullet(ctx, bullet.coords);
  }

  Draw.drawPlayer(ctx, player, globalGameState);

  Draw.drawSpeedometer(ctx, player.speedF, speedometer);

  Draw.drawScore(ctx, globalGameState.score);

  requestAnimationFrame(drawFrame);
})();

// TODO implement collisions
// TODO finish implementing asteroids
// TODO implement counting score
// TODO implement settings for keybinds
// TODO reimplement using ctx.translate ctx.rotate ctx.scale and use createPattern for stars
// TODO add aliens


// улучшение фпс
// двойная буферизация
// пул обьектов (переиспользование)
