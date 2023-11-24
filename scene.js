import { Point } from "./point.js";

class Scene {
	point;
	orientation;
	wallWidth;

	constructor(x, y, r, w) {
		this.point = new Point(x, y, r);
		this.orientation = {
			alpha: 0,
			beta: 0,
			gamma: 0,
		};
		this.wallWidth = w;
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
		if (x < this.point.r + this.wallWidth) {
			x = this.point.r + this.wallWidth;
			this.point.v.x *= -dampingFactor;
			this.point.v.y *= dampingFactor;
		}
		if (x > innerWidth - this.point.r - this.wallWidth) {
			x = innerWidth - this.point.r - this.wallWidth;
			this.point.v.x *= -dampingFactor;
			this.point.v.y *= dampingFactor;
		}
		if (y < this.point.r + this.wallWidth) {
			y = this.point.r + this.wallWidth;
			this.point.v.y *= -dampingFactor;
			this.point.v.x *= dampingFactor;
		}
		if (y > innerHeight - this.point.r - this.wallWidth) {
			y = innerHeight - this.point.r - this.wallWidth;
			this.point.v.y *= -dampingFactor;
			this.point.v.x *= dampingFactor;
		}

		this.point.set(x, y);
	}
}

function toRadians(degrees) {
	return (degrees / 180) * Math.PI;
}

export { Scene };
