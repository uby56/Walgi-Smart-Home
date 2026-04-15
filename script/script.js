gsap.registerPlugin(ScrollTrigger);

// ==========================================
// GLOBAL CONFIG
// ==========================================
ScrollTrigger.config({
  limitCallbacks: true
});

// ==========================================
// 1. THREE.JS SETUP
// ==========================================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf2f7ff, 60, 200);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 12);
camera.rotation.x = -0.1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById("three-canvas-container").appendChild(renderer.domElement);

// ==========================================
// SKY
// ==========================================
const skyGeo = new THREE.SphereGeometry(500, 32, 32);

const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    topColor: { value: new THREE.Color(0x6fb3ff) },
    bottomColor: { value: new THREE.Color(0xf2f7ff) }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;

    void main() {
      float h = normalize(vWorldPosition).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
    }
  `
});

scene.add(new THREE.Mesh(skyGeo, skyMat));

// ==========================================
// LIGHTING
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff2d6, 1.2);
sunLight.position.set(-30, 40, 20);
sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;

sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;

scene.add(sunLight);

// ==========================================
// GROUND
// ==========================================
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0xa8a8a8,
  roughness: 0.85,
  metalness: 0.05
});

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  groundMaterial
);

groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -3;
groundMesh.receiveShadow = true;

scene.add(groundMesh);

// ==========================================
// PLATFORM
// ==========================================
const platformMaterial = new THREE.MeshStandardMaterial({
  color: 0x999999,
  roughness: 0.95,
});

const platform = new THREE.Mesh(
  new THREE.BoxGeometry(60, 0.6, 10),
  platformMaterial
);

platform.position.set(0, -2.9, 0);
platform.receiveShadow = true;

scene.add(platform);

// ==========================================
// LOAD MODELS
// ==========================================
const loader = new THREE.GLTFLoader();

let leftHinge, rightHinge;
let wallL_global, wallR_global;

Promise.all([
  loadModel("images/left_Gate.glb"),
  loadModel("images/right_Gate.glb"),
  loadModel("images/wall.glb"),
  loadModel("images/wall.glb"),
  loadModel("images/morden_wood_cabin_-_small_wood_house.glb"), // ✅ YOUR MODEL
])
.then(([gateL, gateR, wallL, wallR, house]) => {

  wallL_global = wallL.children[0];
  wallR_global = wallR.children[0];

  [gateL, gateR, wallL_global, wallR_global, house].forEach((model) => {
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  });

  // Hinges
  leftHinge = new THREE.Group();
  rightHinge = new THREE.Group();

  const hingeDistance = 18.6;

  leftHinge.position.set(-hingeDistance, 0, 0);
  rightHinge.position.set(hingeDistance, 0, 0);

  // Gates (UNCHANGED)
  gateL.scale.set(4.5, 4.5, 4.5);
  gateR.scale.set(4.5, 4.5, 4.5);

  gateL.position.set(18.7, -2.5, 0);
  gateR.position.set(-18.7, -2.5, 0);

  leftHinge.add(gateL);
  rightHinge.add(gateR);

  scene.add(leftHinge, rightHinge);

  // Walls (UNCHANGED)
  wallL_global.scale.set(1.4, 1.4, 1.4);
  wallR_global.scale.set(1.4, 1.4, 1.4);

  wallL_global.position.set(-18.6, -2.5, -0.5);
  wallR_global.position.set(18.6, -2.5, -0.5);

  scene.add(wallL_global, wallR_global);

  // ==========================================
  // 🏡 AUTO-SCALED HOUSE (PERFECT FIT)
  // ==========================================
  const box = new THREE.Box3().setFromObject(house);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const desiredSize = 70; // 🔥 control size here
  const scaleFactor = desiredSize / Math.max(size.x, size.y, size.z);

  house.scale.setScalar(scaleFactor);

  // recalc
  box.setFromObject(house);
  box.getCenter(center);

  house.position.sub(center);

  // place behind gate
  house.position.set(-18, -1.5, -65);

  house.rotation.y = Math.PI/-8;

  scene.add(house);

  initTimeline();
})
.catch(console.error);

// ==========================================
// LOAD FUNCTION
// ==========================================
function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

// ==========================================
// ANIMATION
// ==========================================
function initTimeline() {

  const openAngle = Math.PI / 2;
  const wallMove = 7.8;
  const wallDepth = -9.4;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#gate-section",
      start: "top top",
      end: "+=300%",
      scrub: 1.2,
      pin: true,
    },
  });

  tl.to(leftHinge.rotation, { y: -openAngle }, 0);
  tl.to(rightHinge.rotation, { y: openAngle }, 0);

  tl.to(wallL_global.position, {
    x: -18.6 - wallMove,
    z: -0.5 - wallDepth
  }, 0);

  tl.to(wallR_global.position, {
    x: 18.6 + wallMove,
    z: -0.5 - wallDepth
  }, 0);
}

// ==========================================
// LOOP
// ==========================================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ==========================================
// RESIZE
// ==========================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});