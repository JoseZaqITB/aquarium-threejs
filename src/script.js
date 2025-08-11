import * as THREE from "three";
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
/**
 * Objects
 */
// cube of example
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);
scene.add(cube);

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
 * loop
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // render
    renderer.render(scene, camera);
    // update objects
    cube.position.y = Math.sin(elapsedTime) * 2
    // call tick again for NEXT FRAME
    window.requestAnimationFrame(tick)
}

// play
tick();

