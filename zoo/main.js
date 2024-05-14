import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { GLBLoader } from "three/examples/jsm/loaders/g";


let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
const loader = new GLTFLoader();

let mixer;



init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  scene.add(controls.getObject());

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // floor
  setFloor();

  // objects
  loadModels();
  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener("resize", onWindowResize);
}

function loadModels() {
  const donkeyUrl = new URL(
    "/assets/gltf/animals/Donkey.gltf",
    import.meta.url
  );
  const deerUrl = new URL(
    "/assets/gltf/animals/Deer.gltf",
    import.meta.url
  );
  const foxUrl = new URL(
    "/assets/gltf/animals/Fox.gltf",
    import.meta.url
  );
  const shibaUrl = new URL(
    "/assets/gltf/animals/ShibaInu.gltf",
    import.meta.url
  );
  const wolfUrl = new URL(
    "/assets/gltf/animals/Wolf.gltf",
    import.meta.url
  );
  const fenceUrl = new URL(
    "/assets/glb/PagarKayu.glb",
    import.meta.url
  );

  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(60,0,-15); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
  });  
  let deer;
  loader.load(deerUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(15, 0, 10); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
    deer = model;
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips,'Idle_2');
    const action = mixer.clipAction(clip);
    action.play();
    });  
  loader.load(foxUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(5, 0, 10); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
  });  
  loader.load(shibaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 10); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
  });  
  loader.load(wolfUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(20, 0, 10); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
  });  
  loader.load(shibaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(25, 0, 10); 
    model.scale.set(3, 3, 3); 
    scene.add(model);
  });
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(30, 0, 0); 
    model.scale.set(5, 5, 5); 
    scene.add(model);
  });  
}

function loadPagar(){
  const url = new URL(
    "/assets/glb/Fence_Design_1.glb",
    import.meta.url
  );
}

function setFloor() {
  let ukuran = 10;
  let floorGeometry = new THREE.PlaneGeometry(ukuran, ukuran);
  floorGeometry.rotateX(-Math.PI / 2);
  const texture = new THREE.TextureLoader().load(
    `/assets/img/pavingTexture.jpg`
  );
  const floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

  let jumlahUbin = 100;
  let ukuranLantai = ukuran * jumlahUbin;
  for (let i = -ukuranLantai; i < ukuranLantai; i += ukuran) {
    for (let j = -ukuranLantai; j < ukuranLantai; j += ukuran) {
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      scene.add(floor);
      floor.position.set(i, 0, j);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}
