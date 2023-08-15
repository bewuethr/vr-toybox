function init() {
	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	let ctx = canvas.getContext("2d");
	ctx.textAlign = "end";
	return [canvas, ctx];
}

function drawBall(ctx, x, y, r) {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.fillText(`x: ${x}`, innerWidth - 10, 20);
	ctx.fillText(`y: ${y}`, innerWidth - 10, 30);
}

function frame(time) {
	drawBall(ctx, x, y, r);
	requestAnimationFrame(frame);
}

addEventListener("keydown", event => {
	let step = 2 * r;
	switch (event.key) {
		case 'ArrowRight':
			x = x + step > innerWidth ? x : x + step;
			break;
		case 'ArrowLeft':
			x = x - step < 0 ? x : x - step;
			break;
		case 'ArrowUp':
			y = y - step < 0 ? y : y - step;
			break;
		case 'ArrowDown':
			y = y + step > innerHeight ? y : y + step;
			break;
	}
});

function setSize() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	x = Math.min(x, innerWidth);
	y = Math.min(y, innerHeight);
	ctx.textAlign = "end";
}

addEventListener("resize", () => setSize());

function requestFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen().catch((err) => {
			console.warn(`Enabling fullscreen mode: ${err.message} (${err.name})`)
		});
	}
}

addEventListener("pointerdown", () => requestFullscreen());

function getSensor() {
	const sensor = new AbsoluteOrientationSensor();
	Promise.all([
		navigator.permissions.query({ name: "accelerometer" }),
		navigator.permissions.query({ name: "magnetometer" }),
		navigator.pemissions.query({ name: "gyroscope" })
	]).then((results) => {
		if (results.every((result) => result.state === "granted")) {
			sensor.start();
		} else {
			console.log("No permissions to use AbsoluteOrientationSensor");
		}
	});

	return sensor;
}

let [canvas, ctx] = init();
const r = 5;
let x = innerWidth / 2, y = innerHeight / 2;
let sensor = getSensor();

requestAnimationFrame(frame);
