import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import sky from "./assets/img/1.png";
import { GLTFLoader, OBJLoader } from "three/examples/jsm/Addons.js";
import { color } from "three/examples/jsm/nodes/Nodes.js";

const rumput = new URL("./assets/gltf/Grass_Small.gltf", import.meta.url);
const assetLoader = new GLTFLoader();

function load(object, x, y, z) {
  assetLoader.load(object.href, function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    console.log(model);
    model.position.set(x, y, z);
    model.material.color.set(0xff0000);
  });

  // Modify the material properties
  // Set color to red (replace with your desired color)
}

const loader = new OBJLoader();
loader.load(
  "./assets/obj/Floor_Wood.obj",
  function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      }
    });

    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("Error loading OBJ file:", error);
  }
);

// load(rumput, 0, 0, 0);
load(rumput, 0, 0, 0.5);
load(rumput, 0, 0, 1.0);
load(rumput, 0, 0, 1.5);
load(rumput, 0, 0, 2.0);
load(rumput, 0, 0, 2.5);
load(rumput, 1, 0, 3.0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, 1000);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
//scene.background = textureLoader.load(sky);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(0, 2, 30);
orbit.update();

// const boxGeometry = new THREE.BoxGeometry();
// const boxMaterial = new THREE.MeshBasicMaterial({color:0x00ffff});
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
//scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sky),
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.background = textureLoader.load(sky);

const gridHelper = new THREE.GridHelper(1000);
scene.add(gridHelper);

// const sphereGeometry = new THREE.SphereGeometry(4);
// const sphereMaterial = new THREE.MeshBasicMaterial({
// 	color: 0x000000,
// });
// const sphere = new Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphere);

renderer.render(scene, camera);

function changeCameraPosition(event) {
  const charCode = event.keyCode;
  //alert(charCode);

  // 38 atau 87(w)  ==> maju
  // 40 atau 83(s) ==> mundur
  // 37 atau 65(a) ==> kiri
  // 39 atau 68(d) ==> kanan

  if (event.keyCode == 38 || event.keyCode == 87) {
    camera.position.z--;
  } else if (event.keyCode == 40 || event.keyCode == 83) {
    camera.position.z++;
  } else if (event.keyCode == 37 || event.keyCode == 65) {
    camera.position.x--;
  } else if (event.keyCode == 39 || event.keyCode == 68) {
    camera.position.x++;
  } else if (event.keyCode == 85) {
    camera.position.y += 0.1;
  }

  renderer.render(scene, camera);
}

document.addEventListener("keydown", changeCameraPosition);

//renderer.setAnimationLoop(animate);
