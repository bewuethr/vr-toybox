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

	const radius = 15;

	const camera = createCamera(canvas, radius);
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xaaaaaa);

	const pointLight = createPointLight(camera.position.x, camera.position.y, radius + 30);
	scene.add(pointLight);

	const directionalLight = createDirectionalLight(
		new THREE.Vector3(camera.position.x, camera.position.y, radius + 100),
		new THREE.Vector3(camera.position.x, camera.position.y, 0),
	);
	scene.add(directionalLight);

	const sphereMesh = createSphereMesh(radius, camera.position.x, camera.position.y);
	scene.add(sphereMesh);

	const planeMesh = createPlaneMesh({
		width: canvas.clientWidth,
		height: canvas.clientHeight,
		x: camera.position.x,
		y: camera.position.y,
		radius,
	});
	scene.add(planeMesh);

	const bdMeshes = createBdMeshes(radius, canvas);
	scene.add(...Object.values(bdMeshes));

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
		const helper = new AxisGridHelper(node, units);
		gui.add(helper, "visible").name(label);
	}
}

function createPointLight(x, y, z) {
	const color = 0xffffff;
	const intensity = 350;
	const light = new THREE.PointLight(color, intensity);

	light.position.set(x, y, z);

	return light;
}

function createDirectionalLight(position, target) {
	const color = 0xffffff;
	const intensity = 0.05;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.copy(position);
	light.target.position.copy(target);

	return light
}

function createCamera(canvas, radius, fov = 45)  {
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const near = 0.1;
	const cameraZ = canvas.clientHeight/2 / Math.tan(fov/2 / 180 * Math.PI) + 3 * radius;
	const far = cameraZ + radius + 5;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const cameraX = canvas.clientWidth / 2;
	const cameraY = canvas.clientHeight / 2;
	camera.position.set(cameraX, cameraY, cameraZ);
	camera.lookAt(cameraX, cameraY, 0);
	
	return camera;
}

function createSphereMesh(radius, x, y) {
	const segments = 100;
	const geometry = new THREE.SphereGeometry(radius, segments, segments);
	const material = new THREE.MeshPhongMaterial({emissive: 0xeec61f});
	const mesh = new THREE.Mesh(geometry, material);

	mesh.position.set(x, y, 0);

	return mesh;
}

function createPlaneMesh(params) {
	const loader = new THREE.TextureLoader();
	const texture = loader.load("checker.png");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;
	const repeatsX = params.width / 20;
	const repeatsY = params.height / 20;
	texture.repeat.set(repeatsX, repeatsY);

	const planeGeometry = new THREE.PlaneGeometry(params.width, params.height);
	const planeMaterial = new THREE.MeshPhongMaterial({map: texture});
	const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
	mesh.position.set(params.x, params.y, -params.radius);

	return mesh;
}

function createBdMeshes(radius, canvas) {
	const vertBdGeometry = 
		new THREE.BoxGeometry(2 * radius, canvas.clientHeight - 2 * radius, 2 * radius);
	const horzBdGeometry =
		new THREE.BoxGeometry(canvas.clientWidth - 2 * radius, 2 * radius, 2 * radius);

	const bdMaterial = new THREE.MeshNormalMaterial();

	const leftBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
	const rightBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
	const bottomBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);
	const topBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);

	leftBdMesh.position.set(radius, canvas.clientHeight / 2 - radius, 0);
	rightBdMesh.position.set(canvas.clientWidth - radius, canvas.clientHeight / 2 + radius, 0);
	bottomBdMesh.position.set(canvas.clientWidth / 2 + radius, radius, 0);
	topBdMesh.position.set(canvas.clientWidth / 2 - radius, canvas.clientHeight - radius, 0);

	return {
		left: leftBdMesh,
		right: rightBdMesh,
		bottom: bottomBdMesh,
		top: topBdMesh,
	};
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
