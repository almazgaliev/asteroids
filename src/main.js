// @ts-nocheck

import * as Draw from "./draw/draw.js";
import * as MyMath from "./math.js";
import { Spaceship } from "./spaceship.js";
import { StarField } from "./stars.js";
import { AsteroidPool, maxPointAmount, rMax, rMin } from "./asteroids.js";
import { BulletPool } from "./bullet.js";
import { Speedometer } from "./ui/speedometer.js";

function collided() {
  for (const a of asteroidField.asteroids) {
    let r = (2 - a.size) * (rMax - rMin) + rMin;
    let p = MyMath.magnitude([a.midX - player.midX, a.midY - player.midY]);
    if (p - r < 0) {
      return true;
    }
  }
  return false;
}

function handleBulletCollisions() {
  for (const bullet of bullets) {
    for (const a of asteroidField.asteroids) {
      let r = (2 - a.size) * (rMax - rMin) + rMin;
      let p = MyMath.magnitude([a.midX - bullet.coords[0], a.midY - bullet.coords[1]]);
      if (p - r < 0) { // попали

        bullets.remove(bullet.id);
        a.hp--;
        if (a.hp == 0) {
          asteroidField.asteroids = asteroidField.asteroids.filter(x => x !== a);
          asteroidField.free_space += a.b - a.a;
          for (let i = a.a; i < a.b; i++) {
            delete asteroidField._coords[a.size][i];
            delete asteroidField.coords[a.size][i];
          }
          if (a.size != 2) {
            let p = a.pos;
            asteroidField.addNew(a.size + 1, p);
            asteroidField.addNew(a.size + 1, p);
          }

          if (asteroidField.free_space == maxPointAmount) {
            asteroidField.addNew(0, [0,0]);
          }
          // add score
          globalGameState.score += Math.round(50 * (3 - a.size) + 500 * player.speedF ** 2);
          return;
        }
      }
    }
  }
}

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

let asteroidField = new AsteroidPool(widthE, heightE, 16);

let bullets = new BulletPool();

let player = new Spaceship([widthE / 2, heightE / 2], 250, 200, 300, 3, true);

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


  // игрок астероид // FIX add normal collisisons
  if (collided())
  {
    alert("You Lost");
    return;
  }

  // пули астероид
  handleBulletCollisions();

  // update asteroids
  asteroidField.update(interval, globalGameState);

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

  Draw.drawAsteroids(ctx, asteroidField);

  for (const bullet of bullets) {
    Draw.drawBullet(ctx, bullet.coords);
  }

  Draw.drawPlayer(ctx, player, globalGameState);

  Draw.drawSpeedometer(ctx, player.speedF, speedometer);

  Draw.drawScore(ctx, globalGameState.score);

  requestAnimationFrame(drawFrame);
})();

// FIX bullet bug
// TODO finish implementing asteroids (генерация новых астероидов)
// TODO implement settings for keybinds
// TODO reimplement using ctx.translate ctx.rotate ctx.scale and use createPattern for stars
// TODO add aliens


// улучшение фпс
// двойная буферизация
// пул обьектов (переиспользование)
