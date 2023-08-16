class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
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
	addEventListener("mousedown", () => document.documentElement.requestFullscreen());
	addEventListener("fullscreenchange", lockOrientation);
	addEventListener("deviceorientationabsolute", handleOrientation);

	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	return canvas.getContext("2d");
}

function handleOrientation(event) {
	scene.orientation = {
		alpha: event.alpha,
		beta: event.beta,
		gamma: event.gamma,
	};
}

function paintScene() {
	const fontSize = 25;
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	ctx.beginPath();
	ctx.arc(scene.point.x, scene.point.y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.textAlign = "end";
	ctx.font = fontSize + "px sans-serif";
	ctx.fillText(`x: ${scene.point.x}`, innerWidth - 10, fontSize - 5);
	ctx.fillText(`y: ${scene.point.y}`, innerWidth - 10, 2 * fontSize);
	ctx.textAlign = "left";
	Object.entries(scene.orientation).forEach(([key, value], idx) => {
		ctx.fillText(`${key}: ${value}`, 10, innerHeight - (4 * fontSize) + idx * (fontSize + 5));
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
	scene.point.set(Math.min(scene.point.x, innerWidth), Math.min(scene.point.y, innerHeight));
}

function lockOrientation() {
	if (document.fullscreenElement != null) {
		screen.orientation.lock("natural");
	}
}

function frame() {
	paintScene();
	requestAnimationFrame(frame);
}

let scene = new Scene();
let ctx = init();
const r = 10;

requestAnimationFrame(frame);
