class Point {
	// Position
	x;
	y;

	// Velocity
	vx = 0;
	vy = 0;

	// Mass
	m = 100;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	// Apply net force on point, but don't move it yet
	updateV(Fx, Fy, dt) {
		let ax = Fx / this.m, ay = Fy / this.m;
		this.vx += (dt * ax);
		this.vy += (dt * ay);
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}

	move(dx, dy) {
		this.x += dx;
		this.y += dy;
	}

	moveX(dx) {
		this.x += dx;
	}

	moveY(dy) {
		this.y += dy;
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
	addEventListener("keydown", updateScene);
	addEventListener("resize", setSize);
	addEventListener("mousedown", fullscreen);
	addEventListener("fullscreenchange", lockOrientation);
	if ("wakeLock" in navigator) {
		addEventListener("fullscreenchange", wakeLock);
	}
	addEventListener("deviceorientation", handleOrientation);

	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	return canvas.getContext("2d");
}

// Acquire the wake lock when going fullscreen, release it when returning from
// fullscreen
async function wakeLock() {
	if (!document.fullscreenElement) {
		wLock = null;
		return;
	}

	try {
		wLock = await navigator.wakeLock.request("screen");
	} catch (err) {
		console.warn(`acquiring wake lock: ${err}`);
	}
}

function fullscreen() {
	document.documentElement.requestFullscreen();
}

function handleOrientation(event) {
	scene.orientation = {
		alpha: event.alpha,
		beta: event.beta,
		gamma: event.gamma,
	};
}

function toRadians(degrees) {
	return (degrees / 180) * Math.PI;
}

function paintScene(dt) {
	const fontSize = 25;
	const dampingFactor = 0.8;
	ctx.clearRect(0, 0, innerWidth, innerHeight);

	// Calculate and apply force vector for unit mass
	const gravity = 9.81;
	let Fx = gravity * Math.sin(toRadians(scene.orientation.gamma));
	let Fy = gravity * Math.sin(toRadians(scene.orientation.beta));
	scene.point.updateV(Fx, Fy, dt);

	// Handle collision with boundary
	let xNew = scene.point.x + scene.point.vx * dt;
	let yNew = scene.point.y + scene.point.vy * dt;
	if (xNew < r) {
		xNew = r;
		scene.point.vx *= -dampingFactor;
	}
	if (xNew > innerWidth - r) {
		xNew = innerWidth - r;
		scene.point.vx *= -dampingFactor;
	}
	if (yNew < r) {
		yNew = r;
		scene.point.vy *= -dampingFactor;
	}
	if (yNew > innerHeight - r) {
		yNew = innerHeight - r;
		scene.point.vy *= -dampingFactor;
	}
	scene.point.x = xNew;
	scene.point.y = yNew;

	// Paint force vectors
	const lFactor = 20;

	// Plane-parallel component of gravitational force
	let x = scene.point.x;
	let y = scene.point.y;
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 5;
	ctx.moveTo(x, y);
	ctx.lineTo(x + lFactor * Fx, y + lFactor * Fy);
	ctx.stroke();

	// Dot
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(scene.point.x, scene.point.y, r, 0, 2 * Math.PI);
	ctx.fill();


	// Coordinates in top right corner
	ctx.textAlign = "end";
	ctx.font = fontSize + "px sans-serif";
	ctx.fillText(`x: ${Math.round(scene.point.x)}`, innerWidth - 10, fontSize - 5);
	ctx.fillText(`y: ${Math.round(scene.point.y)}`, innerWidth - 10, 2 * fontSize);

	// Device position angles in bottom left corner
	Object.entries(scene.orientation).forEach(([key, value], idx) => {
		let yPos = innerHeight - (4 * fontSize) + idx * (fontSize + 5);
		ctx.fillText(`${key}:`, 3.6 * fontSize, yPos);
		ctx.fillText(Math.round(value), 5.4 * fontSize, yPos);
	});
}

function updateScene(event) {
	let step = 2 * r;
	let x = scene.point.x;
	let y = scene.point.y;
	switch (event.key) {
	case "ArrowRight":
		scene.point.x = x + step > innerWidth ? x : x + step;
		break;
	case "ArrowLeft":
		scene.point.x = x - step < 0 ? x : x - step;
		break;
	case "ArrowUp":
		scene.point.y = y - step < 0 ? y : y - step;
		break;
	case "ArrowDown":
		scene.point.y = y + step > innerHeight ? y : y + step;
		break;
	}
}

function setSize() {
	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	scene.point.set(innerWidth / 2, innerHeight / 2);
}

function lockOrientation() {
	if (document.fullscreenElement == null) {
		return;
	}

	screen.orientation.lock("natural")
		.catch((err) => console.warn(`locking orientation: ${err}`));
}

function frame(time) {
	if (start === undefined) {
		start = time;
	}
	let dt = (time - start) / 1000; // convert ms to s

	paintScene(dt);
	tPrev = time;
	requestAnimationFrame(frame);
}

let scene = new Scene();
let ctx = init();
let wLock = null; // eslint-disable-line no-unused-vars
let start, tPrev;
const r = 10;

requestAnimationFrame(frame);
