import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { Scene as SceneModel } from "./scene.js";
import { handleOrientation } from "./handlers.js";
import { AxisGridHelper } from "./axisgridhelper.js";

main();

function main() {
	const canvas = document.querySelector("canvas");
	const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
	// const gui = new GUI();

	const radius = 100;
	const wallWidth = 15;

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

	const bdMeshes = createBdMeshes(wallWidth, radius, canvas);
	scene.add(...Object.values(bdMeshes));

	const sceneModel = new SceneModel(sphereMesh.position.x, sphereMesh.position.y, radius, wallWidth);
	let tPrev;
	addEventListener("deviceorientation", handleOrientation.bind(sceneModel));

	requestAnimationFrame(render);

	const debugDiv = document.querySelector("#debug");

	function render(time) {
		if (tPrev === undefined) {
			tPrev = time;
		}

		const dt = (time - tPrev) / 1000;
		sceneModel.update(dt);
		sphereMesh.position.setX(sceneModel.point.p.x);
		sphereMesh.position.setY(sceneModel.point.p.y);
		tPrev = time;

		debugDiv.innerHTML = `<pre>${createDebugString(sceneModel, dt)}</pre>`;

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
			const cameraX = canvas.clientWidth / 2;
			const cameraY = canvas.clientHeight / 2;
			const cameraZ = canvas.clientHeight/2 / Math.tan(camera.fov/2 / 180 * Math.PI) + 3 * radius;
			camera.position.set(cameraX, cameraY, cameraZ);
			camera.lookAt(cameraX, cameraY, 0);

			pointLight.position.setX(cameraX);
			pointLight.position.setY(cameraY);

			updatePlaneMesh(planeMesh, canvas.clientWidth, canvas.clientHeight, cameraX, cameraY);
			updateBdMeshes(bdMeshes, canvas.clientWidth, canvas.clientHeight, wallWidth, radius);
		}

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	function makeAxisGrid(node, label, units) {
		const helper = new AxisGridHelper(node, units);
		gui.add(helper, "visible").name(label);
	}
}

function createDebugString(sceneModel, dt) {
	return [
		["x", Math.round(sceneModel.point.p.x)],
		["y", Math.round(sceneModel.point.p.y)],
		["vx", Math.round(sceneModel.point.v.x)],
		["vy", Math.round(sceneModel.point.v.y)],
		["ax", Math.round(sceneModel.point.a.x)],
		["ay", Math.round(sceneModel.point.a.y)],
		["dt [ms]", Math.round(dt * 1000)],
	].map(([key, value]) => `  ${key}: ${value}`).join("\n");
}

function createPointLight(x, y, z) {
	const color = 0xffffff;
	const intensity = 500;
	const light = new THREE.PointLight(color, intensity);

	light.position.set(x, y, z);

	return light;
}

function createDirectionalLight(position, target) {
	const color = 0xffffff;
	const intensity = 0.1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.copy(position);
	light.target.position.copy(target);

	return light;
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
	const material = new THREE.MeshPhongMaterial({color: 0xeec61f, specular: 0x111111, shininess: 30});
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

function updatePlaneMesh(mesh, width, height, x, y) {
	mesh.geometry = new THREE.PlaneGeometry(width, height);
	const texture = mesh.material.map;
	texture.repeat.set(width / 20, height / 20);
	mesh.material.map = texture;
	mesh.position.setX(x);
	mesh.position.setY(y);
}

function createBdMeshes(wallWidth, radius, canvas) {
	const vertBdGeometry = 
		new THREE.BoxGeometry(2 * wallWidth, canvas.clientHeight - 2 * wallWidth, 2 * radius);
	const horzBdGeometry =
		new THREE.BoxGeometry(canvas.clientWidth - 2 * wallWidth, 2 * wallWidth, 2 * radius);

	const bdMaterial = new THREE.MeshNormalMaterial();

	const leftBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
	const rightBdMesh = new THREE.Mesh(vertBdGeometry, bdMaterial);
	const bottomBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);
	const topBdMesh = new THREE.Mesh(horzBdGeometry, bdMaterial);

	leftBdMesh.position.set(wallWidth, canvas.clientHeight / 2 - wallWidth, 0);
	rightBdMesh.position.set(canvas.clientWidth - wallWidth, canvas.clientHeight / 2 + wallWidth, 0);
	bottomBdMesh.position.set(canvas.clientWidth / 2 + wallWidth, wallWidth, 0);
	topBdMesh.position.set(canvas.clientWidth / 2 - wallWidth, canvas.clientHeight - wallWidth, 0);

	return {
		left: leftBdMesh,
		right: rightBdMesh,
		bottom: bottomBdMesh,
		top: topBdMesh,
	};
}

function updateBdMeshes(meshes, width, height, wallWidth, radius) {
	[meshes.left, meshes.right].forEach(m =>
		m.geometry = new THREE.BoxGeometry(2 * wallWidth, height - 2 * wallWidth, 2 * radius)
	);
	[meshes.top, meshes.bottom].forEach(m =>
		m.geometry = new THREE.BoxGeometry(width - 2 * wallWidth, 2 * wallWidth, 2 * radius)
	);

	meshes.left.position.set(wallWidth, height / 2 - wallWidth, 0);
	meshes.right.position.set(width - wallWidth, height / 2 + wallWidth, 0);
	meshes.bottom.position.set(width / 2 + wallWidth, wallWidth, 0);
	meshes.top.position.set(width / 2 - wallWidth, height - wallWidth, 0);
}

function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;

	if (needResize) renderer.setSize(width, height, false);

	return needResize;
}
