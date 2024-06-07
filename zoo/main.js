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
let mixer, mixerDonkey, mixerShiba, rotorModel,cameraBoundingSphere;


init();
animate();

function init() {
  cameraBoundingSphere = new THREE.Sphere(new THREE.Vector3(), 2); // radius of 2
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
        if (canJump === true) velocity.y += 200;
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

  // properties
  loadProp();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function loadModels() {
  const donkeyUrl = new URL(
    "/assets/gltf/animals/Donkey.gltf",
    import.meta.url
  );
  const deerUrl = new URL("/assets/gltf/animals/Deer.gltf", import.meta.url);
  const foxUrl = new URL("/assets/gltf/animals/Fox.gltf", import.meta.url);
  const shibaUrl = new URL(
    "/assets/gltf/animals/ShibaInu.gltf",
    import.meta.url
  );
  const wolfUrl = new URL("/assets/gltf/animals/Wolf.gltf", import.meta.url);

  // Load the deer model and create its mixer
  loader.load(deerUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(15, 0, 10);
    model.scale.set(3, 3, 3);
    scene.add(model);

    enableBackfaceCullingForModel(model); // Enable backface culling for the deer model

    // Create the animation mixer for the deer
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    console.log("Animation clips found in GLTF file (Deer):");
    clips.forEach((clip, index) => {
      console.log(`Clip ${index + 1}: ${clip.name}`);
    });

    // Find and play the 'Idle_2' animation
    const idleClip = THREE.AnimationClip.findByName(clips, "Idle_2");
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.loop = THREE.LoopRepeat;
      action.play();
    } else {
      console.error("Idle_2 animation clip not found for Deer!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // Load the donkey model and create its mixer
  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(75, 0, -14);
    model.scale.set(3, 3, 3);
    model.rotation.y = Math.PI; // Rotate 180 degrees around Y-axis
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the donkey model

    // Create the animation mixer for the donkey
    mixerDonkey = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerDonkey.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Donkey!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(60, 0, -14);
    model.scale.set(2, 2, 2);
    scene.add(model);
    enableBackfaceCullingForModel(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(50, 0, -14);
    model.scale.set(2.5, 2.5, 2.5);
    scene.add(model);
    enableBackfaceCullingForModel(model); 

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // Load the shiba model and create its mixer
  loader.load(shibaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 10);
    model.scale.set(2.5, 2.5, 2.5);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the shiba model

    // Create the animation mixer for the shiba
    mixerShiba = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Walk' animation
    const walkClip = THREE.AnimationClip.findByName(clips, "Walk");
    if (walkClip) {
      walkRandomDirection(model, mixerShiba, walkClip);
      const action = mixerShiba.clipAction(walkClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Walk animation clip not found for Shiba!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(wolfUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(20, 0, 10);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}

function loadProp() {
  const fenceUrl = new URL("/assets/glb/PagarKayu.glb", import.meta.url);
  const feedingTrayUrl = new URL(
    "/assets/glb/feedingTray.glb",
    import.meta.url
  );
  const waterTrayUrl = new URL("/assets/glb/waterTray.glb", import.meta.url);
  const barnUrl = new URL("/assets/glb/Barn.glb", import.meta.url);
  const windTurbineUrl = new URL(
    "/assets/glb/windTurbine_new.glb",
    import.meta.url
  );
  const turbine = new URL(
    "/assets/glb//turbine.glb",
    import.meta.url
  );
  
  const rotor = new URL(
    "/assets/glb/rotor.glb",
    import.meta.url
  );

  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(30, 0, 0);
    model.scale.set(5, 5, 5);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the deer model
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
  loader.load(feedingTrayUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(75, 0, -22);
    model.scale.set(17, 17, 17);
    model.rotation.y = Math.PI / 2; // Rotate 90 degrees around Y-axis
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the deer model
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
  loader.load(waterTrayUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(50, 0, -22);
    model.scale.set(5, 5, 5);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the deer model
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
  loader.load(barnUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(130, 0, -25);
    model.scale.set(5, 5, 5);
    scene.add(model);
    enableBackfaceCullingForModel(model);

  model.traverse(function (child) {
    if (child.isMesh) {
      objects.push(child); // Add to objects array
    }
  });
  });
  loader.load(turbine.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(160, 0, -25);
    model.scale.set(3, 7, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
  
// Load the rotor model and store it in a global variable
loader.load(rotor.href, function (gltf) {
  rotorModel = gltf.scene;
  rotorModel.position.set(160, 235, -45);
  rotorModel.scale.set(5, 5, 5);
  scene.add(rotorModel);
  enableBackfaceCullingForModel(rotorModel);
  model.traverse(function (child) {
    if (child.isMesh) {
      objects.push(child);
    }
  });
});
}

function setFloor() {
  let ukuran = 20;
  let floorGeometry = new THREE.PlaneGeometry(ukuran, ukuran);
  floorGeometry.rotateX(-Math.PI / 2);
  const texture = new THREE.TextureLoader().load(
    `/assets/img/grassTexture.jpg`
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
function checkCollision() {
  cameraBoundingSphere.center.copy(controls.getObject().position);

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const objectBoundingBox = new THREE.Box3().setFromObject(object);
    if (cameraBoundingSphere.intersectsBox(objectBoundingBox)) {
      return true;
    }
  }
  return false;
}
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (checkCollision()) {
      velocity.x = 0;
      velocity.z = 0;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }

    // Update animation mixers
    if (mixer) {
      mixer.update(delta); // Update the deer's animation mixer
    }
    if (mixerDonkey) {
      mixerDonkey.update(delta); // Update the donkey's animation mixer
    }
    if (mixerShiba) {
      mixerShiba.update(delta); // Update the shiba's animation mixer
    }

    // Rotate the rotor model
    if (rotorModel) {
      rotorModel.rotation.z += 0.09; // Adjust the rotation speed as needed
    }

    prevTime = time;

    renderer.render(scene, camera);
  }
}

function enableBackfaceCullingForModel(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.side = THREE.FrontSide;
    }
  });
}

function walkRandomDirection(model, mixer, clip) {
  const randomDirection = new THREE.Vector3(
    Math.random() * 2 - 1, // Random x direction between -1 and 1
    0, // Keep y direction constant (no vertical movement)
    Math.random() * 2 - 1 // Random z direction between -1 and 1
  ).normalize(); // Normalize to ensure consistent movement speed

  // Set the model's rotation to face the random direction
  const angle = Math.atan2(randomDirection.x, randomDirection.z);
  model.rotation.y = angle;

  // Play the animation
  if (mixer) {
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopRepeat; // Ensure the animation loops
    action.clampWhenFinished = true;
    action.play();

    // Move the model in the random direction
    const move = () => {
      model.position.x += randomDirection.x * 0.3; // Adjust speed as necessary
      model.position.z += randomDirection.z * 0.3; // Adjust speed as necessary

      // Check constraints and stop movement if out of bounds
      if (model.position.x > 120 || model.position.x < -30) {
        // Adjust position to stay within bounds
        model.position.x = Math.min(Math.max(model.position.x, -30), 120);
        // Generate a new random direction
        walkRandomDirection(model, mixer, clip);
      } else {
        // Continue moving
        requestAnimationFrame(move);
      }
    };

    // Start the movement
    move();
  } else {
    console.error("Animation mixer not initialized!");
  }
}
