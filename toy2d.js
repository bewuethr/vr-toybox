import { wakeLock, fullscreen, handleOrientation, setSize, lockOrientation } from "./handlers.js";

class Point {
	p = {};           // position
	v = {x: 0, y: 0}; // velocity
	a = {x: 0, y: 0}; // acceleration
	m = 0.01;         // mass

	constructor(x, y) {
		this.p = {x, y};
	}

	update(F, dt) {
		const scaleBy = 120; // compensate for 1 pixel = 1 metre
		let pNew = {
			x: this.p.x + this.v.x * dt + this.a.x * dt**2 * 0.5,
			y: this.p.y + this.v.y * dt + this.a.y * dt**2 * 0.5
		};
		let aNew = {
			// scale by 100
			x: scaleBy * F.x / this.m,
			y: scaleBy * F.y / this.m
		};
		let vNew = {
			x: this.v.x + (this.a.x + aNew.x) * (dt * 0.5),
			y: this.v.y + (this.a.y + aNew.y) * (dt * 0.5)
		};

		this.p = pNew;
		this.v = vNew;
		this.a = aNew;
	}

	set(x, y) {
		this.p.x = x;
		this.p.y = y;
	}
}

class Scene {
	point;
	orientation;

	constructor() {
		this.point = new Point(innerWidth / 2, innerHeight / 2);
		this.orientation = {
			alpha: 0,
			beta: 0,
			gamma: 0,
		};
	}
}

function init() {
	addEventListener("resize", setSize.bind(scene));
	addEventListener("mousedown", fullscreen.bind(config));
	addEventListener("fullscreenchange", lockOrientation);
	if ("wakeLock" in navigator) {
		addEventListener("fullscreenchange", wakeLock);
	}
	addEventListener("deviceorientation", handleOrientation.bind(scene));

	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	return canvas.getContext("2d");
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
		y: scene.point.m * gravity * Math.sin(toRadians(scene.orientation.beta))
	};
	scene.point.update(F, dt);

	// Handle collision with boundary
	let {x, y} = scene.point.p;
	if (x < r) {
		x = r;
		scene.point.v.x *= -dampingFactor;
	}
	if (x > innerWidth - r) {
		x = innerWidth - r;
		scene.point.v.x *= -dampingFactor;
	}
	if (y < r) {
		y = r;
		scene.point.v.y *= -dampingFactor;
	}
	if (y > innerHeight - r) {
		y = innerHeight - r;
		scene.point.v.y *= -dampingFactor;
	}

	scene.point.set(x, y);
}

function paintScene(dt) {
	updateModel(dt);
	const fontSize = 25;
	ctx.clearRect(0, 0, innerWidth, innerHeight);

	const lFactor = 0.2;
	let {x, y} = scene.point.p;

	// Paint acceleration vector
	if (config.debug) {
		let {x: ax, y: ay} = scene.point.a;
		ctx.beginPath();
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 5;
		ctx.moveTo(x, y);
		ctx.lineTo(x + lFactor * ax, y + lFactor * ay);
		ctx.stroke();
	}

	// Dot
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();


	if (config.debug) {
		// Coordinates in top right corner
		ctx.textAlign = "end";
		ctx.font = fontSize + "px sans-serif";
		ctx.fillText(`x: ${Math.round(scene.point.p.x)}`, innerWidth - 10, fontSize - 5);
		ctx.fillText(`y: ${Math.round(scene.point.p.y)}`, innerWidth - 10, 2 * fontSize);
		ctx.fillText(`vx: ${Math.round(scene.point.v.x * 100)/100}`, innerWidth - 10, 3 * fontSize);
		ctx.fillText(`vy: ${Math.round(scene.point.v.y * 100)/100}`, innerWidth - 10, 4 * fontSize);
		ctx.fillText(`ax: ${Math.round(scene.point.a.x* 100)/100}`, innerWidth - 10, 5 * fontSize);
		ctx.fillText(`ay: ${Math.round(scene.point.a.y* 100)/100}`, innerWidth - 10, 6 * fontSize);
		ctx.fillText(`dt: ${Math.round(dt * 1000)} ms`, innerWidth - 10, 7 * fontSize);

		// Device position angles in bottom left corner
		Object.entries(scene.orientation).forEach(([key, value], idx) => {
			let yPos = innerHeight - (4 * fontSize) + idx * (fontSize + 5);
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
