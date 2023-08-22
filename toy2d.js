class Point {
	p = {};           // position
	v = {x: 0, y: 0}; // velocity
	a = {x: 0, y: 0}; // acceleration
	m = 1;            // mass
	d = 0.1;          // drag

	constructor(x, y) {
		this.p = {x, y};
	}

	update(F, dt) {
		let pNew = {
			x: this.p.x + this.v.x * dt + this.a.x * dt**2 * 0.5,
			y: this.p.y + this.v.y * dt + this.a.y * dt**2 * 0.5
		};
		let aNew = this.#applyForces(F);
		let vNew = {
			x: (this.a.x + aNew.x) * (dt * 0.5),
			y: (this.a.y + aNew.y) * (dt * 0.5)
		};

		this.p = pNew;
		this.v = vNew;
		this.a = aNew;
	}

	// Calculate new acceleration, where F is force from gravity
	#applyForces(F) {
		// Drag force
		let Fd = {
			x: 0.5 * this.d * this.v.x**2,
			y: 0.5 * this.d * this.v.y**2
		};

		// Drag acceleration
		let ad = {
			x: Fd.x / this.m,
			y: Fd.y / this.m
		};

		return {
			x: F.x / this.m - ad.x,
			y: F.y / this.m - ad.y
		};
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

	// Paint acceleration vector
	const lFactor = 20;
	let {x, y} = scene.point.p;
	let {x: ax, y: ay} = scene.point.a;
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 5;
	ctx.moveTo(x, y);
	ctx.lineTo(x + lFactor * ax, y + lFactor * ay);
	ctx.stroke();

	// Dot
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();


	// Coordinates in top right corner
	ctx.textAlign = "end";
	ctx.font = fontSize + "px sans-serif";
	ctx.fillText(`x: ${Math.round(scene.point.p.x)}`, innerWidth - 10, fontSize - 5);
	ctx.fillText(`y: ${Math.round(scene.point.p.y)}`, innerWidth - 10, 2 * fontSize);
	ctx.fillText(`vx: ${Math.round(scene.point.v.x * 100)/100}`, innerWidth - 10, 3 * fontSize);
	ctx.fillText(`vy: ${Math.round(scene.point.v.y * 100)/100}`, innerWidth - 10, 4 * fontSize);
	ctx.fillText(`ax: ${Math.round(scene.point.a.x* 100)/100}`, innerWidth - 10, 5 * fontSize);
	ctx.fillText(`ay: ${Math.round(scene.point.a.y* 100)/100}`, innerWidth - 10, 6 * fontSize);

	// Device position angles in bottom left corner
	Object.entries(scene.orientation).forEach(([key, value], idx) => {
		let yPos = innerHeight - (4 * fontSize) + idx * (fontSize + 5);
		ctx.fillText(`${key}:`, 3.6 * fontSize, yPos);
		ctx.fillText(Math.round(value), 5.4 * fontSize, yPos);
	});
}

function updateScene(event) {
	let step = 2 * r;
	let x = scene.point.p.x;
	let y = scene.point.p.y;
	switch (event.key) {
	case "ArrowRight":
		scene.point.p.x = x + step > innerWidth ? x : x + step;
		break;
	case "ArrowLeft":
		scene.point.p.x = x - step < 0 ? x : x - step;
		break;
	case "ArrowUp":
		scene.point.p.y = y - step < 0 ? y : y - step;
		break;
	case "ArrowDown":
		scene.point.p.y = y + step > innerHeight ? y : y + step;
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
let start, tPrev; // eslint-disable-line no-unused-vars
const r = 10;

requestAnimationFrame(frame);