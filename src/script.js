import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import vertexShader from "../shaders/particles/vertex.glsl";
import fragmentShader from "../shaders/particles/fragment.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

/**
 * VARS
 */
const gui = new GUI();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();
const menuImg = document.querySelector("img.menu");

const parameters = {
  control: {
    speed: 1,
    acceleration: 5,
  },
  galaxy: {
    count: 1500,
    diameter: 20,
  },
  scene: {
    fogDensity: 0.2,
    background: "#072244",
  },
  world: {
    fishQ:  30,
  },
};
/**
 *  textures
 */
const glassAlphaMap = textureLoader.load("./images/glass_alphaMap.jpg");
glassAlphaMap.repeat = new THREE.Vector2(4,4)
glassAlphaMap.wrapS = THREE.RepeatWrapping;
glassAlphaMap.wrapT = THREE.RepeatWrapping;

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
const fog = new THREE.FogExp2(
  parameters.scene.background,
  parameters.scene.fogDensity
);
scene.fog = fog;
scene.background = new THREE.Color(parameters.scene.background);
// guis
const guiScene = gui.addFolder("scene");
guiScene.addColor(parameters.scene, "background").onChange(() => {
  scene.background.set(parameters.scene.background);
  fog.color.set(parameters.scene.background);
});
guiScene
  .add(parameters.scene, "fogDensity")
  .min(0.01)
  .max(1)
  .step(0.01)
  .onChange(() => {
    fog.density = parameters.scene.fogDensity;
  });
/**
 * enviroment Maps
 */
rgbeLoader.load("./enviromentMaps/ocean-1080.hdr", (envMap) => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = envMap;
});
/**
 * models
 */
const gltfLoader = new GLTFLoader();

let fish = null;
let fishSwimAnimation = null;
gltfLoader.load("assets/models/fish.glb", (gltf) => {
  fish = gltf.scene;
  fish.position.random();

  // fix rotation
  fish.rotation.y -= Math.PI * 0.5;
  fish.updateMatrixWorld();

  fish.traverse((child) => {
    if (child.isMesh) {
      child.geometry.applyMatrix4(fish.matrixWorld);
    }
  });

  // create animation
  const moveFish = (fishModel) => {
    const maxDisplacement = parameters.galaxy.diameter * 0.3;
    const destination = new THREE.Vector3(
      (Math.random() - 0.5) * maxDisplacement,
      (Math.random() - 0.5) * maxDisplacement,
      (Math.random() - 0.5) * maxDisplacement
    );
    destination.add(fishModel.position);
    destination.clamp(
      new THREE.Vector3(
        -parameters.galaxy.diameter * 0.5,
        -parameters.galaxy.diameter * 0.5,
        -parameters.galaxy.diameter * 0.5
      ),
      new THREE.Vector3(
        parameters.galaxy.diameter * 0.5,
        parameters.galaxy.diameter * 0.5,
        parameters.galaxy.diameter * 0.5
      )
    );
    // rotate

    fishModel.lookAt(destination);
    // move
    gsap.to(fishModel.position, {
      duration: 5,
      x: destination.x,
      y: destination.y,
      z: destination.z,
      onComplete: () => moveFish(fishModel),
    });
  };
  const createFish = () => {
    const fishModel = fish.clone();
    const random = Math.random() * 3;
    fishModel.scale.set(random, random, random)
    // random start position
    fishModel.position.random();
    fishModel.position.multiplyScalar(parameters.galaxy.diameter * 0.1);
    // animate
    moveFish(fishModel);
    // add
    scene.add(fishModel);
  };
  for (let i = 0; i <= parameters.world.fishQ; i++) {
    createFish();
  }
});
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
  const scales = new Float32Array(count * 1);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // positions
    positions[i3 + 0] = (Math.random() - 0.5) * parameters.galaxy.diameter;
    positions[i3 + 1] = (Math.random() - 0.5) * parameters.galaxy.diameter;
    positions[i3 + 2] = (Math.random() - 0.5) * parameters.galaxy.diameter;

    // sizes
    scales[i] = Math.random();
  }
  const posAttribute = new THREE.BufferAttribute(positions, 3);
  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", posAttribute);
  particleGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  /* particleMaterial = new THREE.PointsMaterial({
    size: 0.025,
  }); */

  particleMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uFrequency: { value: 0.1 },
      uSize: { value: 25 * renderer.getPixelRatio() },
    },
  });
  oceanParticles = new THREE.Points(particleGeometry, particleMaterial);
  // adding
  scene.add(oceanParticles);
};

// gui
const createGuiParticles = () => {
  const particlesGui = gui.addFolder("particles");
  particlesGui
    .add(parameters.galaxy, "count")
    .min(1)
    .max(10000)
    .step(100)
    .onFinishChange(createParticles);
  particlesGui
    .add(parameters.galaxy, "diameter")
    .min(1)
    .max(100)
    .step(0.1)
    .onFinishChange(createParticles);
  // material
  particlesGui
    .add(particleMaterial.uniforms.uFrequency, "value")
    .min(0.1)
    .max(10)
    .step(0.1)
    .name("uFrequency");
};
/**
 * Objects
 */
// zaqui

const zaqui = new THREE.Group();
const zaquiColor = "#042C71";
const head = new THREE.Mesh(
  new THREE.SphereGeometry(4, 36,36),
  new THREE.MeshStandardMaterial({
    color: zaquiColor
  })
)

const eye1 = new THREE.Mesh(
  new THREE.CircleGeometry(0.5,36,36),
  new THREE.MeshStandardMaterial({color:"white"})
)

eye1.position.z = 4;
eye1.position.x = -1;
const eye2 = eye1.clone()
eye2.position.x = 1;

const pupil1 = new THREE.Mesh(
  new THREE.CircleGeometry(0.1,36,36),
  new THREE.MeshStandardMaterial({color:"black"})
)
pupil1.position.z = 4.01;
pupil1.position.x = -1;

const pupil2 = pupil1.clone();
pupil2.position.x = 1;

const hand1 =  new THREE.Mesh(
  new THREE.CapsuleGeometry( 1, 4, 4, 8 ),
  new THREE.MeshStandardMaterial({color:zaquiColor})
)

hand1.position.x = -8;
hand1.position.z = 2;
hand1.rotation.x = Math.PI * 0.25;

const hand2 = hand1.clone();
hand2.position.x = 8;

const body =  new THREE.Mesh(
  new THREE.CapsuleGeometry( 2, 6, 4, 8 ),
  new THREE.MeshStandardMaterial({color:zaquiColor})
)
body.position.y = -6;

zaqui.add(head, eye1, eye2, hand1, hand2, body, pupil1, pupil2);
zaqui.position.set(0,0 , - parameters.galaxy.diameter * 0.5 - 8.5)
scene.add(zaqui);

// aquarium walls
const walls = new THREE.Group()
const wallPos = parameters.galaxy.diameter * 0.5 + 0.25;
const wall1 = new THREE.Mesh(
  new THREE.PlaneGeometry( wallPos * 2, wallPos * 2),
  new THREE.MeshStandardMaterial({alphaMap: glassAlphaMap, transparent: true})
)
const wall2 = wall1.clone();
const wall3 = wall1.clone();
const wall4 = wall1.clone();
const wall5 = wall1.clone();

wall2.rotation.y = - Math.PI * 0.5;
wall3.rotation.y = Math.PI;
wall4.rotation.y =  Math.PI * 0.5;
wall5.rotation.x = - Math.PI * 0.5;

wall1.position.z = - wallPos;
wall2.position.x = wallPos;
wall3.position.z = wallPos;
wall4.position.x = - wallPos;
wall5.position.y = - wallPos;


walls.add(wall1, wall2, wall3, wall4, wall5)
scene.add(walls)
// cube of example
/* const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);

scene.add(cube); */
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 3);
scene.add(ambientLight);
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
  if (!control.isLocked) {
        // hide menu
        menuImg.style.display = "none";
        // enable controls
        control.lock();
      }
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
    case "Enter":
      if (!control.isLocked) {
        // hide menu
        menuImg.style.display = "none";
        // enable controls
        control.lock();
      }
      break; // TEMPORARY!!! ORIGINALLY CLICK LISTENER
    case "Escape":
      // hide menu
      menuImg.style.display = "block";
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
  if (particleMaterial !== null) {
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
  // limit distance from origin
  if(control.getObject().position.length() >= parameters.galaxy.diameter * 0.5) {
    control.getObject().position.setLength(parameters.galaxy.diameter * 0.5);
  }
  // render
  renderer.render(scene, camera);
  // update objects
  //cube.position.y = Math.sin(elapsedTime) * 2

  // call tick again for NEXT FRAME
  window.requestAnimationFrame(tick);
};

// play
createParticles();
createGuiParticles();
tick();
