import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";

/**
 * VARS
 */
const gui = new GUI();
const parameters = {
  galaxy: {
    count: 1000,
    radius: 10,
  },
};
/**
 * Listeners
 */
// resize screen
window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  // camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  // render size
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // render temp
  renderer.render(scene, camera);
});
/**
 * scene
 */
const scene = new THREE.Scene();
// settings
scene.background = new THREE.Color(0x1f4366);
/**
 * Particles
 */
let particleGeometry = null;
let particleMaterial = null;
let oceanParticles = null;
const createParticles = () => {
  // clear old particles
  if (oceanParticles !== null) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(oceanParticles);
  }
  //
  const count = parameters.galaxy.count;
  const positions = new Float32Array(count * 3);
  positions.forEach(
    (pos, index) =>
      (positions[index] = (Math.random() - 0.5) * parameters.galaxy.radius)
  );
  const posAttribute = new THREE.BufferAttribute(positions, 3);
  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", posAttribute);

  particleMaterial = new THREE.PointsMaterial({
    size: 0.025,
  });
  oceanParticles = new THREE.Points(particleGeometry, particleMaterial);
  // adding
  scene.add(oceanParticles);
};
createParticles();

// gui
gui
  .add(parameters.galaxy, "count")
  .min(1)
  .max(10000)
  .step(100)
  .onFinishChange(() => {
    createParticles();
  });
gui
  .add(parameters.galaxy, "radius")
  .min(1)
  .max(1000)
  .step(1)
  .onFinishChange(() => {
    createParticles();
  });
/**
 * Objects
 */
// cube of example
/* const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);
scene.add(cube); */

/**
 * canvas
 */
// parameters
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// canvas
const canvas = document.querySelector("canvas.webgl");

/**
 * camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10
);
camera.position.z = 5;
scene.add(camera);

/**
 * controls
 */
const control = new OrbitControls(camera, canvas);

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * loop
 */
const clock = new THREE.Clock();
let prevTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;
  // update control
  control.update(deltaTime);

  // render
  renderer.render(scene, camera);
  // update objects
  //cube.position.y = Math.sin(elapsedTime) * 2
  // call tick again for NEXT FRAME
  window.requestAnimationFrame(tick);
};

// play
tick();
