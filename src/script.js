import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import vertexShader from "../shaders/particles/vertex.glsl"
import fragmentShader from "../shaders/particles/fragment.glsl"

/**
 * VARS
 */
const gui = new GUI();
const parameters = {
  control: {
    speed: 0.25,
    acceleration: 5,
  },
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

  /* particleMaterial = new THREE.PointsMaterial({
    size: 0.025,
  }); */

  particleMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: {value: 0},
      uFrequency: {value: 0.1}
    }
  })
  oceanParticles = new THREE.Points(particleGeometry, particleMaterial);
  // adding
  scene.add(oceanParticles);
};
createParticles();

// gui
const particlesGui = gui.addFolder("particles");
particlesGui
  .add(parameters.galaxy, "count")
  .min(1)
  .max(10000)
  .step(100)
  .onFinishChange(() => {
    createParticles();
  });
particlesGui
  .add(parameters.galaxy, "radius")
  .min(1)
  .max(1000)
  .step(1)
  .onFinishChange(() => {
    createParticles();
  });
// material
particlesGui
  .add(particleMaterial.uniforms.uFrequency, "value")
  .min(0.1)
  .max(10)
  .step(0.1)
  .name("uFrequency");
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
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * controls
 */
const control = new PointerLockControls(camera, renderer.domElement);
const velocity = { forward: 0, right: 0 };

const forwardCameraDirection = new THREE.Vector3(0, 0, 0);
control.getDirection(forwardCameraDirection);

// listeners
window.addEventListener("click", () => {
  if (!control.isLocked) control.lock();
});

window.addEventListener("keydown", (key) => {
  switch (key.code) {
    case "KeyW":
      velocity.forward = 1;
      break;
    case "KeyS":
      velocity.forward = -1;
      break;
    case "KeyD":
      velocity.right = 1;
      break;
    case "KeyA":
      velocity.right = -1;
      break;
  }
});

window.addEventListener("keyup", (key) => {
  switch (key.code) {
    case "KeyW":
      velocity.forward = 0;
      control.getDirection(forwardCameraDirection);
      if (velocity.right === 0) currentVelocity = 0;
      break;
    case "KeyS":
      velocity.forward = -0;
      control.getDirection(forwardCameraDirection);
      if (velocity.right === 0) currentVelocity = 0;
      break;
    case "KeyD":
      velocity.right = 0;
      if (velocity.forward === 0) currentVelocity = 0;
      break;
    case "KeyA":
      velocity.right = -0;
      if (velocity.forward === 0) currentVelocity = 0;
      break;
  }
});

control.getDi;

// guis
const controlGui = gui.addFolder("Control");
controlGui.add(parameters.control, "acceleration").min(0.1).max(50).step(0.1);
controlGui.add(parameters.control, "speed").min(0.25).max(100).step(0.25);

/**
 * loop
 */
const clock = new THREE.Clock();
let prevTime = 0;
let currentVelocity = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;
  // shaders
  if(particleMaterial !== null) {
    particleMaterial.uniforms.uTime.value = elapsedTime;
  }
  // update control
  if (velocity.forward != 0 || velocity.right != 0) {
    currentVelocity +=
      (parameters.control.speed * 0.025 - currentVelocity) *
      parameters.control.acceleration *
      deltaTime;
    if (velocity.forward != 0) {
      control.moveForward(velocity.forward * currentVelocity);
      control.getDirection(forwardCameraDirection);

      camera.position.y +=
        forwardCameraDirection.y * velocity.forward * currentVelocity;
    }

    if (velocity.right != 0)
      control.moveRight(velocity.right * currentVelocity);
  }

  // render
  renderer.render(scene, camera);
  // update objects
  //cube.position.y = Math.sin(elapsedTime) * 2

  // call tick again for NEXT FRAME
  window.requestAnimationFrame(tick);
};

// play
tick();
