// @ts-nocheck

import * as Draw from "./draw/draw.js";
import { fillCircle } from "./draw/core.js";
import * as MyMath from "./math.js";
import { Spaceship } from "./spaceship.js";
import { StarField } from "./stars.js";
import { AsteroidPool, rMax, rMin } from "./asteroids.js";
import { BulletPool } from "./bullet.js";
import { Speedometer } from "./ui/speedometer.js";


function collided() {
  for (const coord of player.body) {
    console.log(coord)
    for (const a of asteroidField.asteroids) {
      let r = (2 - a.size) * (rMax - rMin) + rMin;
      let p = MyMath.magnitude([a.midX - coord[0], a.midY - coord[1]]);
      if (p - r < 0) {
        return true;
      }
    }
  }
  return false;
}

function handleBulletCollisions(bullets, asteroidField) {
  let hits = globalGameState.hits;
  let shatters = [];
  for (const bullet of bullets) {
    for (let a of asteroidField.asteroids) {
      let r = (2 - a.size) * (rMax - rMin) + rMin;
      let p = MyMath.magnitude([a.midX - bullet.coords[0], a.midY - bullet.coords[1]]);
      if (p - r < 0) { // попали
        hits.add(bullet.id);
        a.hp--;
        if (a.hp == 0) {
          asteroidField.shatter(a);
          shatters.push(a);
          // add score
          globalGameState.score += Math.round(50 * (3 - a.size) + 500 * player.speedF ** 2);
        }
      }
    }
  }
  asteroidField.asteroids = asteroidField.asteroids.filter(x => !shatters.includes(x));

  for (let hit of hits) {
    bullets.remove(hit);
  }
  hits.clear();
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
  get width() { return document.body.clientWidth; }, // FIX
  get height() { return 800; },
  get widthE() { return this.width + this.outBX; },
  get heightE() { return this.height + this.outBY; },
  keys: {
    "KeyW": false,
    "KeyA": false,
    "KeyD": false,
    "KeyL": false,
  },
  prevT: NaN,
  score: 0,
  hits: new Set,
};

let widthE = globalGameState.widthE;
let heightE = globalGameState.heightE;

let speedometer = new Speedometer([globalGameState.width - 40, globalGameState.height - 30], 160, 140);

let asteroidField = new AsteroidPool(widthE, heightE, 16);

let bullets = new BulletPool();

let player = new Spaceship([widthE / 2, heightE / 2], 250, 200, 300, 3, true);

let starFields = [
  new StarField(25, 0.5, 1.0, widthE, heightE), // 50000 is laggy on ff
  new StarField(70, 0.4, 0.8, widthE, heightE),
  new StarField(200, 0.3, 0.6, widthE, heightE)
];

let canvas = document.getElementById("main-canvas");

canvas.setAttribute("width", globalGameState.width);
canvas.setAttribute("height", globalGameState.height);

// FIX


let ctx = canvas.getContext("2d");
let posX = 0;
let posY = 0;

let listeners = createKeyHandlers(globalGameState);
document.addEventListener("keypress", listeners[0]);
document.addEventListener("keyup", listeners[1]);
window.addEventListener("resize", resetProps);

resetProps();
function resetProps() {
  canvas.setAttribute("width", globalGameState.width);
  canvas.setAttribute("height", globalGameState.height);
  posX = 20 / 1200 * globalGameState.width;
  posY = 40 / 800 * globalGameState.height;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1 / 1200 * globalGameState.width;
  // ctx.font = "10em Chakra Petch";
  ctx.font = `${Math.floor(100 / 1200 * globalGameState.width)} Chakra Petch`;
}

let dots0 = [];
let dots1 = [];

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
    if (a !== undefined) {
      dots0.unshift([...a.coord]);
      dots0.splice(10);
      bullets.push(a.coord, a.vector);
    }
  }


  // игрок астероид
  // if (collided()) {
  // alert("You Lost");
  // return;
  // }

  // пули астероид
  handleBulletCollisions(bullets, asteroidField);

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

  for (const dot of dots0) {
    ctx.fillStyle = "#f00";
    fillCircle(ctx, ...dot, 3);
  }

  for (const dot of dots1) {
    ctx.fillStyle = "#0f0";
    fillCircle(ctx, ...dot, 3);
  }

  for (const bullet of bullets) {
    dots1.unshift([...bullet.coords]);
    dots1.splice(10);
    Draw.drawBullet(ctx, bullet.coords);
  }



  Draw.drawPlayer(ctx, player, collided() ? "#f00" : "#fff", globalGameState);

  Draw.drawSpeedometer(ctx, player.speedF, speedometer);

  Draw.drawScore(ctx, globalGameState.score, posX, posY);

  requestAnimationFrame(drawFrame);
})();
