import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

class AxisGridHelper {
	constructor(node, units = 10) {
		const axes = new THREE.AxesHelper();
		axes.material.depthTest = false;
		axes.renderOrder = 2;
		node.add(axes);

		const grid = new THREE.GridHelper(units, units);
		grid.material.depthTest = false;
		grid.renderOrder = 1;
		node.add(grid);

		this.grid = grid;
		this.axes = axes;
		this.visible = false;
	}

	get visible() {
		return this._visible;
	}
	
	set visible(v) {
		this._visible = v;
		this.grid.visible = v;
		this.axes.visible = v;
	}
}

main();

function main() {
	const canvas = document.querySelector("canvas");
	const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
	// const gui = new GUI();

	const fov = 45;
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const near = 0.1;
	// const cameraZ = canvas.clientHeight/2 * Math.tan(Math.PI / 4);
	const cameraZ = 1250;
	const radius = 15;
	const far = cameraZ + radius + 5;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const cameraX = canvas.clientWidth / 2;
	const cameraY = canvas.clientHeight / 2;
	camera.position.set(cameraX, cameraY, cameraZ);
	camera.lookAt(cameraX, cameraY, 0);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xaaaaaa);

	const segments = 100;
	const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);

	{
		const color = 0xffffff;
		const intensity = 350;
		const light = new THREE.PointLight(color, intensity);
		light.position.set(camera.position.x, camera.position.y, radius + 30);
		scene.add(light);
	}

	{
		const color = 0xffffff;
		const intensity = 0.3;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(camera.position.x, camera.position.y, radius + 100);
		light.target.position.set(camera.position.x, camera.position.y, 0);
		scene.add(light);
	}

	const sphereMaterial = new THREE.MeshPhongMaterial({emissive: 0xeec61f});
	const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphereMesh.position.set(camera.position.x, camera.position.y, 0);
	console.log(sphereMesh);
	scene.add(sphereMesh);

	{
		const planeSizeX = canvas.clientWidth;
		const planeSizeY = canvas.clientHeight;

		const loader = new THREE.TextureLoader();
		const texture = loader.load("assets/checker.png");
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeatsX = planeSizeX / 20;
		const repeatsY = planeSizeY / 20;
		texture.repeat.set(repeatsX, repeatsY);

		const planeGeometry = new THREE.PlaneGeometry(planeSizeX, planeSizeY);
		const planeMaterial = new THREE.MeshPhongMaterial({map: texture});
		const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
		mesh.position.set(camera.position.x, camera.position.y, -radius);
		console.log(mesh);
		scene.add(mesh);
	}

	{
		const vertBdGeometry = new THREE.BoxGeometry(2 * radius,
			canvas.clientHeight - 2 * radius, 2 * radius);
		const horzBdGeometry = new THREE.BoxGeometry(canvas.clientWidth - 2 * radius,
			2 * radius, 2 * radius);
		const bdMaterial = new THREE.MeshPhongMaterial({
			emissive: 0x18a3c9,
		});

		const leftBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
		leftBdMesh.position.set(radius, canvas.clientHeight / 2 - radius, 0);
		scene.add(leftBdMesh);

		const rightBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
		rightBdMesh.position.set(canvas.clientWidth - radius,
			canvas.clientHeight / 2 + radius, 0);
		scene.add(rightBdMesh);

		const bottomBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);
		bottomBdMesh.position.set(canvas.clientWidth / 2 + radius,
			radius, 0);
		scene.add(bottomBdMesh);

		const topBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);
		topBdMesh.position.set(canvas.clientWidth / 2 - radius,
			canvas.clientHeight - radius, 0);
		scene.add(topBdMesh);

	}

	requestAnimationFrame(render);

	function render(time) {
		time *= 0.001;

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	function makeAxisGrid(node, label, units) {
		console.log(gui);
		const helper = new AxisGridHelper(node, units);
		gui.add(helper, "visible").name(label);
	}
}

function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;

	if (needResize) renderer.setSize(width, height, false);

	return needResize;
}

function createMaterial() {
	const material = new THREE.MeshPhongMaterial({
		side: THREE.DoubleSide,
	});

	const hue = Math.random();
	const saturation = 1;
	const luminance = 0.5;
	material.color.setHSL(hue, saturation, luminance);

	return material;
}
