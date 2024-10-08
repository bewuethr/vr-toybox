import {
  wakeLock,
  fullscreen,
  handleOrientation,
  setSize,
  lockOrientation,
} from './handlers.js';

class Point {
  p = {}; // position
  v = { x: 0 }; // velocity
  a = { x: 0 }; // acceleration
  m = 0.01; // mass

  constructor(x) {
    this.p = { x };
  }

  update(F, dt) {
    let pNew = {
      x: this.p.x + this.v.x * dt + this.a.x * dt ** 2 * 0.5,
    };
    let aNew = {
      x: (100 * F.x) / this.m, // scale by 100
    };
    let vNew = {
      x: this.v.x + (this.a.x + aNew.x) * (dt * 0.5),
    };

    this.p = pNew;
    this.v = vNew;
    this.a = aNew;
  }

  set(x) {
    this.p.x = x;
  }
}

class Scene {
  point;
  orientation;

  constructor() {
    this.point = new Point(innerWidth / 2);
    this.orientation = {
      alpha: 0,
      beta: 0,
      gamma: 0,
    };
  }
}

function init(scene, config) {
  addEventListener('resize', setSize.bind(scene));
  addEventListener('mousedown', fullscreen.bind(config));
  addEventListener('fullscreenchange', lockOrientation);
  if ('wakeLock' in navigator) {
    addEventListener('fullscreenchange', wakeLock);
  }
  addEventListener('deviceorientation', handleOrientation.bind(scene));

  let canvas = document.querySelector('canvas');
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  return canvas.getContext('2d');
}

function toRadians(degrees) {
  return (degrees / 180) * Math.PI;
}

function updateModel(dt) {
  const dampingFactor = 0.5;
  const gravity = 9.81;

  // Calculate and apply force vector
  let F = {
    x: scene.point.m * gravity * Math.sin(toRadians(scene.orientation.gamma)),
  };
  scene.point.update(F, dt);

  // Handle collision with boundary
  let { x } = scene.point.p;
  if (x < r) {
    x = r;
    scene.point.v.x *= -dampingFactor;
  }
  if (x > innerWidth - r) {
    x = innerWidth - r;
    scene.point.v.x *= -dampingFactor;
  }

  scene.point.set(x);
}

function paintScene(dt) {
  updateModel(dt);
  const fontSize = 25;
  const y = innerHeight / 2;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  const lFactor = 0.2;
  let { x } = scene.point.p;

  // Paint acceleration vector
  if (config.debug) {
    let { x: ax } = scene.point.a;
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.moveTo(x, y);
    ctx.lineTo(x + lFactor * ax, y);
    ctx.stroke();
  }

  // Dot
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();

  if (config.debug) {
    // Coordinates in top right corner
    ctx.textAlign = 'end';
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillText(
      `x: ${Math.round(scene.point.p.x)}`,
      innerWidth - 10,
      fontSize - 5,
    );
    ctx.fillText(
      `vx: ${Math.round(scene.point.v.x * 100) / 100}`,
      innerWidth - 10,
      2 * fontSize,
    );
    ctx.fillText(
      `ax: ${Math.round(scene.point.a.x * 100) / 100}`,
      innerWidth - 10,
      3 * fontSize,
    );
    ctx.fillText(
      `dt: ${Math.round(dt * 1000)} ms`,
      innerWidth - 10,
      4 * fontSize,
    );

    // Device position angles in bottom left corner
    Object.entries(scene.orientation).forEach(([key, value], idx) => {
      let yPos = innerHeight - 4 * fontSize + idx * (fontSize + 5);
      ctx.fillText(`${key}:`, 3.6 * fontSize, yPos);
      ctx.fillText(Math.round(value), 5.4 * fontSize, yPos);
    });
  }
}

function frame(time) {
  if (tPrev === undefined) {
    tPrev = time;
  }
  let dt = (time - tPrev) / 1000; // convert ms to s

  paintScene(dt);
  tPrev = time;
  requestAnimationFrame(frame);
}

let config = { debug: false };
let scene = new Scene();
let ctx = init(scene, config);
let tPrev;
const r = 10;

requestAnimationFrame(frame);
