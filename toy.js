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
		this.orientation = [0, 0, 0, 0];
	}
}

function init() {
	const sensor = new AbsoluteOrientationSensor();
	Promise.all([
		navigator.permissions.query({ name: "accelerometer" }),
		navigator.permissions.query({ name: "magnetometer" }),
		navigator.permissions.query({ name: "gyroscope" })
	]).then((results) => {
		if (results.every((result) => result.state === "granted")) {
			sensor.onreading = updateOrientation(sensor);
			sensor.start();
		} else {
			console.log("No permissions to use AbsoluteOrientationSensor");
		}
	});

	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	return canvas.getContext("2d");
}

function updateOrientation(sensor) {
	scene.orientation = sensor.quaternion;
}

function paintScene() {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	ctx.beginPath();
	ctx.arc(scene.point.x, scene.point.y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.textAlign = "end";
	ctx.fillText(`x: ${scene.point.x}`, innerWidth - 10, 20);
	ctx.fillText(`y: ${scene.point.y}`, innerWidth - 10, 30);
	ctx.textAlign = "left";
	scene.orientation.forEach((el, idx) => {
		ctx.fillText(`[${idx}]: ${el}`, 10, innerHeight - 50 + idx * 10);
	});
}

function frame() {
	paintScene();
	requestAnimationFrame(frame);
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

addEventListener("keydown", updateScene);

function setSize() {
	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	scene.point.set(Math.min(scene.point.x, innerWidth),
		Math.min(scene.point.y, innerHeight));
}

addEventListener("resize", () => setSize());

let ctx = init();
let scene = new Scene();
const r = 5;

requestAnimationFrame(frame);
