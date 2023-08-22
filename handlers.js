let wLock = null; // eslint-disable-line no-unused-vars

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
	if (document.fullscreenElement == null) {
		document.documentElement.requestFullscreen();

		return;
	}

	this.debug = !this.debug;
}

function handleOrientation(event) {
	this.orientation = {
		alpha: event.alpha,
		beta: event.beta,
		gamma: event.gamma,
	};
}

function setSize() {
	let canvas = document.querySelector("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	this.point.set(innerWidth / 2, innerHeight / 2);
}

function lockOrientation() {
	if (document.fullscreenElement == null) {
		return;
	}

	screen.orientation.lock("natural")
		.catch((err) => console.warn(`locking orientation: ${err}`));
}

export { wakeLock, fullscreen, handleOrientation, setSize, lockOrientation };
