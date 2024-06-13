import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { GLBLoader } from "three/examples/jsm/loaders/g";

let camera, scene, renderer, controls;
let isInteractive = false;
let shibaSprint = false;
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
let mixer,
  mixerDonkey,
  mixerDonkey2,
  mixerDonkey3,
  mixerDonkey4,
  mixerShiba,
  mixerAlpaca,
  mixerAlpaca2,
  mixerAlpaca3,
  mixerHorse,
  mixerHorse2,
  mixerHorse3,
  mixerStag,
  mixerStag2,
  mixerStag3,
  cameraBoundingSphere,
  lawnMower,
  shiba;

init();
animate();

function init() {
  cameraBoundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xB0E0E6);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 700, 0).normalize();
  scene.add(light);

  const hemilight = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
  hemilight.position.set(0.5, 1, 0.75);
  scene.add(hemilight);

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

      case "KeyE":
        console.log("KeyE pressed");
        if (isNearLawnMower()) {
          isInteractive = true;
        }
        if (isNearShiba()) {
          console.log("deketshiba");
          shibaSprint = true;
        }
        // Unlock controls if either condition is met
        if (isNearLawnMower() || isNearShiba()) {
          controls.lock(); // Unlock the controls
        }
        break;

      case "KeyQ":
        console.log("KeyQ pressed");
        if (isInteractive) {
          isInteractive = false;
          controls.lock(); // Lock the controls again
          // Ubah posisi y player +200 dan x player -20
          controls.getObject().position.y += 20;
          controls.getObject().position.z -= 5;
        }
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

function loadDonkey() {
  const donkeyUrl = new URL(
    "/assets/gltf/animals/Donkey.gltf",
    import.meta.url
  );

  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(65, 0, -30);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the donkey model

    // Create the animation mixer for the donkey
    mixerDonkey = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
  // Log all animation clips
  console.log("Available animation clips:", clips);
  clips.forEach((clip, index) => {
    console.log(`Clip ${index}:`, clip.name);
  });
    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Idle_2");
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
    model.position.set(80, 0, -30);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    // Create the animation mixer for the donkey
    mixerDonkey2 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerDonkey2.clipAction(eatingClip);
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

  // donkey 2
  loader.load(donkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(50, 0,-20);
    model.scale.set(2.5, 2.5, 2.5);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    // Create the animation mixer for the donkey
    mixerDonkey3 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerDonkey3.clipAction(eatingClip);
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
    model.position.set(60, 0,-50);
    model.scale.set(2.5, 2.5, 2.5);
    model.rotateY(-Math.PI/2);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    // Create the animation mixer for the donkey
    mixerDonkey4 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Attack_Headbutt");
    if (eatingClip) {
      const action = mixerDonkey4.clipAction(eatingClip);
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
}
function loadAlpaca() {
  const alpacaUrl = new URL(
    "/assets/gltf/animals/Alpaca.gltf",
    import.meta.url
  );

  loader.load(alpacaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(75, 0, -100);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the donkey model

    // Create the animation mixer for the donkey
    mixerAlpaca = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerAlpaca.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Alpaca!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(alpacaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(80, 0, -120);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);
// Create the animation mixer for the donkey
mixerAlpaca2 = new THREE.AnimationMixer(model);
const clips = gltf.animations;

// Find and play the 'Eating' animation
const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
if (eatingClip) {
  const action = mixerAlpaca2.clipAction(eatingClip);
  action.loop = THREE.LoopRepeat;
  action.clampWhenFinished = true;
  action.play();
} else {
  console.error("Eating animation clip not found for Alpaca!");
}
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // donkey 2
  loader.load(alpacaUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(50, 0, -105);
    model.scale.set(2.5, 2.5, 2.5);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);
// Create the animation mixer for the donkey
mixerAlpaca3 = new THREE.AnimationMixer(model);
const clips = gltf.animations;

// Find and play the 'Eating' animation
const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
if (eatingClip) {
  const action = mixerAlpaca3.clipAction(eatingClip);
  action.loop = THREE.LoopRepeat;
  action.clampWhenFinished = true;
  action.play();
} else {
  console.error("Eating animation clip not found for Alpaca!");
}
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}
function loadHorse() {
  const horseUrl = new URL(
    "/assets/gltf/animals/Horse.gltf",
    import.meta.url
  );

  loader.load(horseUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(-20, 0, -100);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the donkey model

    // Create the animation mixer for the donkey
    mixerHorse = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerHorse.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Alpaca!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(horseUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(-10, 0, -120);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);

    // Create the animation mixer for the donkey
    mixerHorse2 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerHorse2.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Alpaca!");
    }
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // donkey 2
  loader.load(horseUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, -105);
    model.scale.set(2.5, 2.5, 2.5);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);

    // Create the animation mixer for the donkey
    mixerHorse3 = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerHorse3.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Alpaca!");
    }
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}
function loadStag() {
  const stagUrl = new URL(
    "/assets/gltf/animals/Stag.gltf",
    import.meta.url
  );
  loader.load(stagUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(-20, 0, -20);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the donkey model

    // Create the animation mixer for the donkey
    mixerStag = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Find and play the 'Eating' animation
    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    if (eatingClip) {
      const action = mixerStag.clipAction(eatingClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Eating animation clip not found for Alpaca!");
    }

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(stagUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(-10, 0, -40);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);
// Create the animation mixer for the donkey
mixerStag2 = new THREE.AnimationMixer(model);
const clips = gltf.animations;

// Find and play the 'Eating' animation
const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
if (eatingClip) {
  const action = mixerStag2.clipAction(eatingClip);
  action.loop = THREE.LoopRepeat;
  action.clampWhenFinished = true;
  action.play();
} else {
  console.error("Eating animation clip not found for Alpaca!");
}
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // donkey 2
  loader.load(stagUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, -20);
    model.scale.set(2.5, 2.5, 2.5);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);
// Create the animation mixer for the donkey
mixerStag3 = new THREE.AnimationMixer(model);
const clips = gltf.animations;

// Find and play the 'Eating' animation
const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
if (eatingClip) {
  const action = mixerStag3.clipAction(eatingClip);
  action.loop = THREE.LoopRepeat;
  action.clampWhenFinished = true;
  action.play();
} else {
  console.error("Eating animation clip not found for Alpaca!");
}
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}

function loadModels() {
  const shibaUrl = new URL(
    "/assets/gltf/animals/ShibaInu.gltf",
    import.meta.url
  );

  loadDonkey();
  loadAlpaca();
  loadHorse();
  loadStag();
  
  loader.load(shibaUrl.href, function (gltf) {
    shiba = gltf.scene;
    shiba.position.set(0, 0, 10);
    shiba.scale.set(2.5, 2.5, 2.5);
    scene.add(shiba);
    enableBackfaceCullingForModel(shiba);

    mixerShiba = new THREE.AnimationMixer(shiba);
    const clips = gltf.animations;

    const walkClip = THREE.AnimationClip.findByName(clips, "Walk");
    if (walkClip) {
      walkRandomDirection(shiba, mixerShiba, walkClip);
      const action = mixerShiba.clipAction(walkClip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = true;
      action.play();
    } else {
      console.error("Walk animation clip not found for Shiba!");
    }
    shiba.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}

function loadProp() {
  loadKandang(0, 0);
  loadKandang(-80, 0);
  loadKandang(0, -80);
  loadKandang(-80, -80);

  const lawn_mower = new URL(
    "/assets/glb/lawn_mower.glb",
    import.meta.url
  );

  const matahariURL = new URL(
    "/assets/glb/sun.glb",
    import.meta.url
  );

  loadKincir(0, 0);
  loadKincir(0, -80);
  loadKincir(0, -160);

  
  loader.load(matahariURL.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 700, 0);
    model.scale.set(3, 3, 3);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });


  loader.load(lawn_mower.href, function (gltf) {
    lawnMower = gltf.scene;

    // Set position and scale
    lawnMower.position.set(100, 4, 0);
    lawnMower.scale.set(5, 5, 5);

    // Rotate the model 180 degrees around the y-axis
    lawnMower.rotation.y = Math.PI; // 180 degrees in radians

    // Add the model to the scene
    scene.add(lawnMower);

    // Enable backface culling for the model
    enableBackfaceCullingForModel(lawnMower);

    // Traverse the model and push each mesh to the objects array
    lawnMower.traverse(function (child) {
        if (child.isMesh) {
            objects.push(child);
        }
    });
});
}

function loadKandang(x, z) {
  
  const fenceUrl = new URL("/assets/glb/fence.glb", import.meta.url);
  const waterTrayUrl = new URL("/assets/glb/waterTray.glb", import.meta.url);

  // kandang donkey depan
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(45 + x, 0, -5 + z);
    model.scale.set(6, 6, 6);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang donkey depan 2
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(70 + x, 0, -5 + z);
    model.scale.set(6, 6, 6);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang donkey belakang
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(70 + x, 0, -55 + z);
    model.scale.set(6, 6, 6);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang donkey belakang 2
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(95 + x, 0, -55 + z);
    model.scale.set(6, 6, 6);
    model.rotateY(Math.PI);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang samping kiri
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(45 + x, 0, -30 + z);
    model.scale.set(6, 6, 6);

    model.rotateY(-Math.PI / 2);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(45 + x, 0, -55 + z);
    model.scale.set(6, 6, 6);

    model.rotateY(-Math.PI / 2);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang kanan donkey
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(95 + x, 0, -5 + z);
    model.scale.set(6, 6, 6);

    model.rotateY(Math.PI / 2);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // kandang kanan donkey
  loader.load(fenceUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(95 + x, 0, -30 + z);
    model.scale.set(6, 6, 6);

    model.rotateY(Math.PI / 2);
    scene.add(model);
    enableBackfaceCullingForModel(model);
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  // pohon
  const treeUrl = new URL("/assets/gltf/NormalTree_1.gltf", import.meta.url);
  const leafTexture = new THREE.TextureLoader().load(
    "./assets/img/NormalTree_Leaves.png"
  );

  const barkTexture = new THREE.TextureLoader().load(
    "./assets/img/NormalTree_Bark.png"
  );


  loader.load(treeUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(50 + x, 0, -50 + z);
    model.scale.set(4, 4, 4);
    model.rotateY(Math.PI);
    scene.add(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        if (child.name === "Cylinder001_1") {
          // Assign leaf texture
          child.material.map = leafTexture;
          child.material.emissive = new THREE.Color(0x00ff00); // Put your color here
          child.material.emissiveIntensity = 0.08; // Adjust intensity as needed

          console.log("Leaf texture applied");
        } else {
          child.material.map = barkTexture;
          console.log("Bark texture applied");
        }
        child.material.needsUpdate = true;
      }
    });
  });

  loader.load(waterTrayUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(55 + x, 0, -10 + z);
    model.scale.set(5, 5, 5);
    scene.add(model);
    enableBackfaceCullingForModel(model); // Enable backface culling for the deer model
    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });
}

function loadKincir(x, z) {
  const kincirUrl = new URL("/assets/glb/kincir.glb", import.meta.url);

  loader.load(kincirUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(180 + x, 0, -14 + z);
    model.scale.set(7, 7, 7);
    model.rotateY(-Math.PI / 2);

    // Create a group for the entire windmill
    let windmillGroup = new THREE.Group();
    windmillGroup.add(model);
    scene.add(windmillGroup);

    let balingMesh;
    let bodyMesh;
    let balingGroup = new THREE.Group();

    model.traverse(function (child) {
      if (child.isMesh && child.name.toLowerCase().includes("blade")) {
        balingMesh = child;
      } else {
        bodyMesh = child;
      }

      objects.push(child);
    });

    if (balingMesh) {
      // Pindahkan baling-baling ke pusat
      const bladeColor = new THREE.Color(0xff0013); // Green color, you can change this
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: bladeColor,
      });
      balingMesh.material = bladeMaterial;

      balingMesh.geometry.computeBoundingBox();
      const boundingBox = balingMesh.geometry.boundingBox;
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      balingMesh.position.sub(center);

      balingGroup.add(balingMesh);
      model.add(balingGroup);

      // Sesuaikan posisi grup baling-baling ke posisi pusat kincir angin
      balingGroup.position.copy(center);

      let animationTime = 0;

      function animateBalingBaling() {
        const rotationSpeed = 0.01; // Kecepatan rotasi
        animationTime += rotationSpeed;
        balingGroup.rotation.z = animationTime;
        requestAnimationFrame(animateBalingBaling);
      }

      animateBalingBaling();
    }

    if (bodyMesh) {
      const bladeColor = new THREE.Color(0xffffcc); // Green color, you can change this
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: bladeColor,
      });
      bodyMesh.material = bladeMaterial;
    }
  });
  const benchUrl = new URL("/assets/glb/park_bench.glb", import.meta.url);


  // BENcH 1
  loader.load(benchUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(180 + x, 2 , 15 +z);
    model.scale.set(7, 7, 7);
    // model.rotateY(  Math.PI/2)
    scene.add(model);
    enableBackfaceCullingForModel(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  //BENCH 2
  loader.load(benchUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(180 + x, 2 , -40 +z);
    model.scale.set(7, 7, 7);
    // model.rotateY(  Math.PI/2)
    scene.add(model);
    enableBackfaceCullingForModel(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
      }
    });
  });

  const treeUrl = new URL("/assets/gltf/NormalTree_1.gltf", import.meta.url);
  const leafTexture = new THREE.TextureLoader().load(
    "./assets/img/NormalTree_Leaves.png"
  );

  const barkTexture = new THREE.TextureLoader().load(
    "./assets/img/NormalTree_Bark.png"
  );


  loader.load(treeUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(200 + x, 0, -35 + z);
    model.scale.set(4, 4, 4);
    model.rotateY(Math.PI);
    scene.add(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        if (child.name === "Cylinder001_1") {
          // Assign leaf texture
          child.material.map = leafTexture;
          child.material.emissive = new THREE.Color(0x00ff00); // Put your color here
          child.material.emissiveIntensity = 0.08; // Adjust intensity as needed

          console.log("Leaf texture applied");
        } else {
          child.material.map = barkTexture;
          console.log("Bark texture applied");
        }
        child.material.needsUpdate = true;
      }
    });
  });

  loader.load(treeUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(200 + x, 0, 10 + z);
    model.scale.set(4, 4, 4);
    model.rotateY(Math.PI);
    scene.add(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        if (child.name === "Cylinder001_1") {
          // Assign leaf texture
          child.material.map = leafTexture;
          child.material.emissive = new THREE.Color(0x00ff00); // Put your color here
          child.material.emissiveIntensity = 0.08; // Adjust intensity as needed

          console.log("Leaf texture applied");
        } else {
          child.material.map = barkTexture;
          console.log("Bark texture applied");
        }
        child.material.needsUpdate = true;
      }
    });
  });
}

function setFloor() {
  let ukuran = 30;
  let floorGeometry = new THREE.PlaneGeometry(ukuran, ukuran);
  floorGeometry.rotateX(-Math.PI / 2);
  const texture = new THREE.TextureLoader().load(
    `/assets/img/grassTexture.jpg`
  );
  const floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

  let jumlahUbin = 10;
  let ukuranLantai = ukuran * jumlahUbin;
  for (let i = -ukuranLantai ; i < ukuranLantai; i += ukuran) {
    for (let j = -ukuranLantai ; j < ukuranLantai; j += ukuran) {
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

    const move = () => {
      if (shibaSprint) {
        model.position.x += randomDirection.x * 0.6;
        model.position.z += randomDirection.z * 0.6;

        setTimeout(() => {
          shibaSprint = false;
        }, 2000);

        if (model.position.x > 120 || model.position.x < -30) {
          model.position.x = Math.min(Math.max(model.position.x, -30), 120);
          // Generate a new random direction
          walkRandomDirection(model, mixer, clip);
        } else {
          // Continue moving
          requestAnimationFrame(move);
        }
      } else {
        model.position.x += randomDirection.x * 0.3;
        model.position.z += randomDirection.z * 0.3;

        if (model.position.x > 120 || model.position.x < -30) {
          model.position.x = Math.min(Math.max(model.position.x, -30), 120);
          walkRandomDirection(model, mixer, clip);
        } else {
          // Continue moving
          requestAnimationFrame(move);
        }
      }
    };

    // Start the movement
    move();
  } else {
    console.error("Animation mixer not initialized!");
  }
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
function isNearLawnMower() {
  const lawnMowerPosition = new THREE.Vector3(
    lawnMower.position.x,
    lawnMower.position.y,
    lawnMower.position.z
  );
  const playerPosition = controls.getObject().position;
  const distance = playerPosition.distanceTo(lawnMowerPosition);
  const threshold = 10; // Distance threshold to consider "near"

  if (distance <= threshold) {
    return true;
  }
  return false;
}
function isNearShiba() {
  const shibaPosition = new THREE.Vector3(
    shiba.position.x,
    shiba.position.y,
    shiba.position.z
  );
  const playerPosition = controls.getObject().position;
  const distance = playerPosition.distanceTo(shibaPosition);
  console.log(distance);
  const threshold = 13; // Distance threshold to consider "near"

  if (distance <= threshold) {
    return true;
  }
  return false;
}
// Create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Create a global audio source
const sound = new THREE.Audio(listener);

// Load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("assets/sound/lawnmower.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true); // Set to true if you want the music to loop
  sound.setVolume(0.2); // Adjust volume as needed
  if (isInteractive) {
    sound.play();
  }
});
let shibaSprintStart = 0; // variabel untuk menyimpan waktu mulai shibaSprint
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  if (controls.isLocked === true) {
    if (isInteractive) {
      // Update camera position behind the lawn mower
      const lawnMowerPosition = new THREE.Vector3(
        lawnMower.position.x,
        lawnMower.position.y,
        lawnMower.position.z
      );
      const offset = new THREE.Vector3(0, 5, -7); // Adjust the offset as needed
      camera.position.copy(lawnMowerPosition).add(offset);
      // camera.lookAt(lawnMowerPosition);
      if (!sound.isPlaying) {
        sound.play();
      }
      // Move the lawn_mower along with the camera (player movement)
      if (moveForward) {
        // Move lawn_mower forward
        lawnMower.position.z -= velocity.z * delta;
      } else if (moveBackward) {
        // Move lawn_mower backward
        lawnMower.position.z -= velocity.z * delta;
      } else if (moveLeft) {
        // Move lawn_mower forward
        lawnMower.position.x += velocity.x * delta;
      } else if (moveRight) {
        // Move lawn_mower backward
        lawnMower.position.x += velocity.x * delta;
      }
    } else {
      if (sound.isPlaying) {
        sound.stop();
      }
    }
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    // misal maju = 1 - 0 = 1
    // misal mundur = 0 - 1 = -1

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += velocity.y * delta;

    if (checkCollision()) {
      controls.moveRight(velocity.x * delta);
      controls.moveForward(velocity.z * delta);
      controls.getObject().position.y += velocity.y * delta;
    }

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }

    // Update animation mixers
    if (mixer) {
      mixer.update(delta); // Update the deer's animation mixer
    }
    if (mixerDonkey && mixerDonkey2 && mixerDonkey3 && mixerDonkey4) {
      mixerDonkey.update(delta); // Update the donkey's animation mixer
      mixerDonkey2.update(delta*0.5); // Update the donkey's animation mixer
      mixerDonkey3.update(delta*0.8); // Update the donkey's animation mixer
      mixerDonkey4.update(delta*0.6); // Update the donkey's animation mixer
    }
    if (mixerShiba) {
      mixerShiba.update(delta); // Update the shiba's animation mixer
    }
    if (mixerAlpaca && mixerAlpaca2 && mixerAlpaca3) {
      mixerAlpaca.update(delta); // Update the shiba's animation mixer
      mixerAlpaca2.update(delta*0.5); // Update the shiba's animation mixer
      mixerAlpaca3.update(delta*0.7); // Update the shiba's animation mixer
    }
    if (mixerHorse && mixerHorse2 && mixerHorse3) {
      mixerHorse.update(delta); // Update the shiba's animation mixer
      mixerHorse2.update(delta*0.4); // Update the shiba's animation mixer
      mixerHorse3.update(delta*0.6); // Update the shiba's animation mixer
    }
    if (mixerStag && mixerStag2 && mixerStag3) {
      mixerStag.update(delta); // Update the shiba's animation mixer
      mixerStag2.update(delta*0.7); // Update the shiba's animation mixer
      mixerStag3.update(delta*0.5); // Update the shiba's animation mixer
    }

    prevTime = time;
    renderer.render(scene, camera);
  }
}
