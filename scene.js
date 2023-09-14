import { Point } from "./point.js";

class Scene {
	point;
	orientation;

	constructor(x, y, r) {
		this.point = new Point(x, y, r);
		this.orientation = {
			alpha: 0,
			beta: 0,
			gamma: 0,
		};
	}

	update(dt) {
		const dampingFactor = 0.5;
		const gravity = 9.81;

		// Calculate and apply force vector
		const F = {
			x: this.point.m * gravity * Math.sin(toRadians(this.orientation.gamma)),
			y: -this.point.m * gravity * Math.sin(toRadians(this.orientation.beta))
		};
		this.point.update(F, dt);

		// Handle collision with boundary
		let {x, y} = this.point.p;
		if (x < 3 * this.point.r) {
			x = 3 * this.point.r;
			this.point.v.x *= -dampingFactor;
		}
		if (x > innerWidth - 3 * this.point.r) {
			x = innerWidth - 3 * this.point.r;
			this.point.v.x *= -dampingFactor;
		}
		if (y < 3 * this.point.r) {
			y = 3 * this.point.r;
			this.point.v.y *= -dampingFactor;
		}
		if (y > innerHeight - 3 * this.point.r) {
			y = innerHeight - 3 * this.point.r;
			this.point.v.y *= -dampingFactor;
		}

		this.point.set(x, y);
	}
}

function toRadians(degrees) {
	return (degrees / 180) * Math.PI;
}

export { Scene };
