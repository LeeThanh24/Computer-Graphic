// JavaScript: index.js

import {
  Vector2,
  DoubleSide,
  MeshBasicMaterial,
  RingGeometry,
  PlaneGeometry,
  Clock,
  Vector3,
  Group,
  FloatType,
  PMREMGenerator,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Color,
  Mesh,
  SphereGeometry,
  MeshPhysicalMaterial,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PCFSoftShadowMap,
  DirectionalLight,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  MeshPhongMaterial,
  Audio,
  AudioListener,
  AudioLoader,
  Quaternion,
} from "https://cdn.skypack.dev/three@0.137";
import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import anime from "https://cdn.skypack.dev/animejs@3.2.1";
import { QuadraticBezierCurve3 } from "https://cdn.skypack.dev/three@0.137";

// Declare the background
let sunBackground = document.querySelector(".sun-background");
let moonBackground = document.querySelector(".moon-background");

// Set up the scene
const scene = new Scene();

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const ringsScene = new Scene();

const ringsCamera = new PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  1000
);
ringsCamera.position.set(0, 0, 50);

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Move the scene around
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// Set up the sun
const sunLight = new DirectionalLight(new Color("#FFFFFF"), 3.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

// Set up the moon
const moonLight = new DirectionalLight(
  new Color("#77ccff").convertSRGBToLinear(),
  0
);
moonLight.position.set(-10, 20, 10);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 512;
moonLight.shadow.mapSize.height = 512;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 100;
moonLight.shadow.camera.left = -10;
moonLight.shadow.camera.bottom = -10;
moonLight.shadow.camera.top = 10;
moonLight.shadow.camera.right = 10;
scene.add(moonLight);

// Set up audio listener and audio
const listener = new AudioListener();
camera.add(listener);

const sound = new Audio(listener);
const audioLoader = new AudioLoader();
audioLoader.load("assets/plane-sound.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

let mousePos = new Vector2(0, 0);

window.addEventListener("mousemove", (e) => {
  let x = e.clientX - innerWidth * 0.5;
  let y = e.clientY - innerHeight * 0.5;

  mousePos.x = x * 0.0003;
  mousePos.y = y * 0.0003;
});

let moon;
let moonMaterial;
var ring1,
  ring2,
  ring3 = "";

let isPlaneMoving = false; // Biến cờ theo dõi trạng thái di chuyển của máy bay

function addLocations() {
  const locations = [
    {
      name: "Bangkok, Thailand",
      position: { x: 6, y: 3, z: 8 },
      image: "assets/end.png",
      transition: {
        name: "Hong Kong, China",
        position: { x: 6.5, y: 4, z: 7 },
        image: "assets/transition.png",
      },
    },
    {
      name: "Seoul, Korea",
      position: { x: -7.5, y: 4, z: 6 },
      image: "assets/end.png",
      transition: {
        name: "Tokyo, Japan",
        position: { x: -7, y: 5, z: 6 },
        image: "assets/transition.png",
      },
    },
    {
      name: "London, England",
      position: { x: 3, y: 2, z: -10 },
      image: "assets/end.png",
      transition: {
        name: "Paris, France",
        position: { x: 4, y: 3, z: -9 },
        image: "assets/transition.png",
      },
    },
    {
      name: "Cali, USA",
      position: { x: 0, y: 0, z: -10.5 },
      image: "assets/end.png",
      transition: {
        name: "New York, USA",
        position: { x: -2, y: 1, z: -10 },
        image: "assets/transition.png",
      },
    },
  ];

  locations.forEach((loc) => {
    const texture = new TextureLoader().load(loc.image);
    const material = new SpriteMaterial({ map: texture });
    const sprite = new Sprite(material);
    sprite.position.set(loc.position.x, loc.position.y, loc.position.z);
    sprite.scale.set(1, 1, 1); // Adjust the scale as needed
    sprite.name = loc.name;
    sprite.userData.isLocation = true;
    sprite.userData.locationName = loc.name; // Add location name to userData
    sprite.userData.transition = loc.transition; // Add transition to userData
    scene.add(sprite);

    // Add transition point sprite
    const transitionTexture = new TextureLoader().load(loc.transition.image);
    const transitionMaterial = new SpriteMaterial({ map: transitionTexture });
    const transitionSprite = new Sprite(transitionMaterial);
    transitionSprite.position.set(
      loc.transition.position.x,
      loc.transition.position.y,
      loc.transition.position.z
    );
    transitionSprite.scale.set(0.5, 0.5, 0.5); // Adjust the scale as needed
    transitionSprite.name = loc.transition.name;
    transitionSprite.userData.isTransition = true;
    transitionSprite.userData.locationName = loc.transition.name; // Add transition name to userData
    scene.add(transitionSprite);
  });
}

(async function () {
  let pmrem = new PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(FloatType)
    .loadAsync("assets/quarry_cloudy_4k.hdr"); // thanks to https://polyhaven.com/hdris !
  let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

  ring1 = new Mesh(
    new RingGeometry(15, 13.5, 80, 1, 0),
    new MeshPhysicalMaterial({
      color: new Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(200),
      roughness: 0.25,
      envMap,
      envMapIntensity: 1.8,
      side: DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
  );
  ring1.sunOpacity = 0.35;
  ring1.moonOpacity = 0.03;
  ringsScene.add(ring1);

  ring2 = new Mesh(
    new RingGeometry(16.5, 15.75, 80, 1, 0),
    new MeshBasicMaterial({
      color: new Color("#FFCB8E").convertSRGBToLinear(),
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
    })
  );
  ring2.sunOpacity = 0.35;
  ring2.moonOpacity = 0.1;
  ringsScene.add(ring2);

  ring3 = new Mesh(
    new RingGeometry(18, 17.75, 80),
    new MeshBasicMaterial({
      color: new Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(50),
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
    })
  );
  ring3.sunOpacity = 0.35;
  ring3.moonOpacity = 0.03;
  ringsScene.add(ring3);

  let textures = {
    bump: await new TextureLoader().loadAsync("assets/earthbump.jpg"),
    map: await new TextureLoader().loadAsync("assets/Earth_Texture_Full.jpg"),
    spec: await new TextureLoader().loadAsync("assets/earthspec.jpg"),
    moonTexture: await new TextureLoader().loadAsync("assets/moon.jpg"),
    planeTrailMask: await new TextureLoader().loadAsync("assets/mask.png"),
  };

  // Create planes fly around earth
  let plane = (
    await new GLTFLoader().loadAsync("assets/plane/11805_airplane_v2_L2.glb")
  ).scene.children[0];
  let planesData = [makePlane(plane, textures.planeTrailMask, envMap, scene)];
  let sphere = new Mesh(
    new SphereGeometry(10, 70, 70),
    new MeshPhysicalMaterial({
      map: textures.map,
      roughnessMap: textures.spec,
      bumpMap: textures.bump,
      bumpScale: 0.05,
      envMap,
      envMapIntensity: 0.4,
      sheen: 1,
      sheenRoughness: 0.75,
      sheenColor: new Color("#ff8a00").convertSRGBToLinear(),
      clearcoat: 0,
    })
  );
  sphere.sunEnvIntensity = 0.4;
  sphere.moonEnvIntensity = 0.1;
  sphere.rotation.y += Math.PI * 1.25;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // Load model vệ tinh
  let satelite;
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("assets/plane/satelite.glb", (gltf) => {
    satelite = gltf.scene;
    let modelSize = 0.35;
    satelite.scale.set(modelSize, modelSize, modelSize);

    let satelitePosition = new Vector3(0, 4.5, 0);
    satelitePosition.add(sphere.position);
    satelite.position.copy(satelitePosition);

    scene.add(satelite);
    satelite.addEventListener("click", () => {
      console.log("Bạn đã click vào tên lửa!");
    });

    renderer.domElement.addEventListener("click", (event) => {
      event.preventDefault();
      let mouse = new Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      let raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);

      let intersects = raycaster.intersectObjects([sphere]);
    });

    const moonGeometry = new SphereGeometry(8, 64, 64);
    moonMaterial = new MeshPhysicalMaterial({
      color: new Color("#d4d4d4").convertSRGBToLinear(),
      roughness: 0.2,
      envMapIntensity: 1,
      map: textures.moonTexture,
    });
    moon = new Mesh(moonGeometry, moonMaterial);
    moon.position.set(-30, 0, 0);
    scene.add(moon);
  });

  let clock = new Clock();
  let daytime = true;
  let animating = false;
  let isNight = false;

  window.addEventListener("mousemove", (e) => {
    if (animating) return;

    let anim;
    if (e.clientX > innerWidth - 200 && !daytime) {
      anim = [1, 0];
    } else if (e.clientX < 200 && daytime) {
      anim = [0, 1];
    } else {
      return;
    }

    animating = true;

    let obj = { t: 0 };
    anime({
      targets: obj,
      t: anim,
      complete: () => {
        animating = false;
        daytime = !daytime;
      },
      update: () => {
        sunLight.intensity = 3.5 * (1 - obj.t);
        moonLight.intensity = 3.5 * obj.t;
        sunLight.position.setY(20 * (1 - obj.t));
        moonLight.position.setY(20 * obj.t);

        sphere.material.sheen = 1 - obj.t;

        scene.children.forEach((child) => {
          child.traverse((object) => {
            if (object instanceof Mesh && object.material.envMap) {
              object.material.envMapIntensity =
                object.sunEnvIntensity * (1 - obj.t) +
                object.moonEnvIntensity * obj.t;
            }
          });
        });

        ringsScene.children.forEach((child) => {
          child.traverse((object) => {
            object.material.opacity =
              object.sunOpacity * (1 - obj.t) + object.moonOpacity * obj.t;
          });
        });

        sunBackground.style.opacity = 1 - obj.t;
        moonBackground.style.opacity = obj.t;
      },
      easing: "easeInOutSine",
      duration: 500,
    });
  });

  let earthRotation = 0;
  let moonRotation = 0;
  let newX = 0;
  let newZ = 0;

  renderer.setAnimationLoop(() => {
    let delta = clock.getDelta();
    addLocations(); // Add this line to call the function after creating the Earth sphere

    ringScene();

    if (moon) {
      const moonRotationSpeed = 0.2;
      moon.rotation.y += delta * moonRotationSpeed;

      const distanceFromEarth = 30;
      const moonOrbitRadius = 50;
      const moonOrbitSpeed = 0.3;
      const moonOrbitAngle = delta * moonOrbitSpeed;
      const cosAngle = Math.cos(moonOrbitAngle);
      const sinAngle = Math.sin(moonOrbitAngle);
      newX = moon.position.x * cosAngle - moon.position.z * sinAngle;
      newZ = moon.position.x * sinAngle + moon.position.z * cosAngle;
      moon.position.set(newX, 0, newZ);
      moonMaterial.color = new Color("#d4d4d4").convertSRGBToLinear();
    }

    planesData.forEach((planeData) => {
      let plane = planeData.group;
      earthRotation += delta * 0.1;

      if (!isPlaneMoving) {
        // Chỉ cập nhật vị trí máy bay nếu không di chuyển
        plane.position.set(0, 0, 0);
        plane.rotation.set(0, 0, 0);
        plane.updateMatrixWorld();

        plane.rotateOnAxis(new Vector3(0, 1, 0), 5);
        plane.rotateOnAxis(new Vector3(0, 0, 1), 5);
        plane.translateY(planeData.yOff);
        plane.rotateOnAxis(new Vector3(1, 0, 0), +Math.PI * 0.5);
      }
      sphere.rotation.y = earthRotation;
    });

    controls.update();
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(ringsScene, ringsCamera);
    renderer.autoClear = true;
  });
})();
// Biến toàn cục để theo dõi máy bay được chọn
let selectedPlane = null;
let targetPosition = null;

function makePlane(planeMesh, trailTexture, envMap, scene) {
  let plane = planeMesh.clone();
  let planeSize = 0.002;
  plane.scale.set(planeSize, planeSize, planeSize);
  plane.position.set(0, 0, 0);
  plane.rotation.set(0, 3.1, 0);
  plane.updateMatrixWorld();

  plane.traverse((object) => {
    if (object instanceof Mesh) {
      object.material.envMap = envMap;
      object.sunEnvIntensity = 1;
      object.moonEnvIntensity = 0.3;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  let trail = new Mesh(
    new PlaneGeometry(1, 2),
    new MeshPhysicalMaterial({
      envMap,
      envMapIntensity: 3,
      roughness: 0.4,
      metalness: 0,
      transmission: 1,
      transparent: true,
      opacity: 1,
      alphaMap: trailTexture,
    })
  );
  trail.sunEnvIntensity = 3;
  trail.moonEnvIntensity = 0.7;
  trail.rotateX(Math.PI);
  trail.translateY(1.1);

  let group = new Group();
  group.add(plane);
  group.add(trail);

  group.userData.isPlane = true;

  scene.add(group);

  return {
    group,
    rot: Math.random() * Math.PI * 2.0,
    rad: Math.random() * Math.PI * 0.45 + 0.2,
    yOff: 10.5 + Math.random() * 1.0,
    randomAxis: new Vector3(nr(), nr(), nr()).normalize(),
    randomAxisRot: Math.random() * Math.PI * 2,
  };
}

renderer.domElement.addEventListener("mousemove", function (event) {
  let mouse = new Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  let raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children, true);

  let isHoveringPlane = false;

  if (intersects.length > 0) {
    let intersectedObject = intersects[0].object;

    if (intersectedObject.parent && intersectedObject.parent.userData.isPlane) {
      isHoveringPlane = true;
    }
  }

  if (isHoveringPlane) {
    renderer.domElement.style.cursor = "pointer";
  } else {
    renderer.domElement.style.cursor = "default";
  }
});

renderer.domElement.addEventListener("click", function (event) {
  event.preventDefault();

  let mouse = new Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  let raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children, true);
  targetPosition = intersects[0].point;

  // Lấy thông tin của địa điểm được click
  let locationInfo = {
    from: "Sai Gon, Viet Nam",
    transition: "",
    to: "",
    distance: "0",
    duration: "0",
  };

  if (intersects.length > 0) {
    let intersectedObject = intersects[0].object;
    if (intersectedObject.parent && intersectedObject.parent.userData.isPlane) {
      if (!selectedPlane) {
        selectedPlane = intersectedObject.parent;
        console.log("Plane selected:", selectedPlane.position);
        // locationInfo["from"] = `(${
        //   Math.round(selectedPlane.position.x * 100) / 100
        // },${Math.round(selectedPlane.position.y * 100) / 100},${
        //   Math.round(selectedPlane.position.z * 100) / 100
        // })`;

        updateFlightInformation(locationInfo);
        sound.play();
      }
    } else if (selectedPlane) {
      let targetPosition = intersects[0].point;
      locationInfo["to"] = `(${Math.round(targetPosition.x * 100) / 100},${
        Math.round(targetPosition.y * 100) / 100
      },${Math.round(targetPosition.z * 100) / 100})`;

      let distance = calDistance(
        [targetPosition.x, targetPosition.y, targetPosition.z],
        [
          selectedPlane.position.x,
          selectedPlane.position.y,
          selectedPlane.position.z,
        ]
      );
      locationInfo["distance"] = `${Math.trunc(distance * 1000)}`;
      locationInfo["duration"] = `${Math.trunc((distance * 1000) / numPoints)}`;
      // locationInfo["from"] = `(${
      //   Math.round(selectedPlane.position.x * 100) / 100
      // },${Math.round(selectedPlane.position.y * 100) / 100},${
      //   Math.round(selectedPlane.position.z * 100) / 100
      // })`;

      updateFlightInformation(locationInfo);
    } else {
      locationInfo["to"] = `(${Math.round(targetPosition.x * 100) / 100},${
        Math.round(targetPosition.y * 100) / 100
      },${Math.round(targetPosition.z * 100) / 100})`;
      updateFlightInformation(locationInfo);
    }
    // Check if the clicked object is a location
    if (intersectedObject.userData.isLocation) {
      locationInfo["to"] = intersectedObject.userData.locationName;
      locationInfo["transition"] = intersectedObject.userData.transition.name; // Update transition
      currentTransition = intersectedObject.userData;
      // console.log(intersectedObject.userData);
      updateFlightInformation(locationInfo);
    }
    // Check if the clicked object is a transition
    if (intersectedObject.userData.isTransition) {
      locationInfo["to"] = intersectedObject.userData.locationName;
      updateFlightInformation(locationInfo);
    }
  }
});

var numPoints = 300;
var currentTransition = null;
function animatePlaneMovement(plane, transitionPosition, targetPosition) {
  let smokeTrail = createSmokeTrail();
  scene.add(smokeTrail);

  const start = plane.position.clone();
  const radius = 10; // Bán kính của quả cầu Trái Đất

  function toSpherical(cartesian) {
    const radius = Math.sqrt(
      cartesian.x * cartesian.x +
        cartesian.y * cartesian.y +
        cartesian.z * cartesian.z
    );
    const theta = Math.acos(cartesian.y / radius); // Góc cực
    const phi = Math.atan2(cartesian.z, cartesian.x); // Góc phương vị
    return { radius, theta, phi };
  }

  function toCartesian(spherical) {
    const { radius, theta, phi } = spherical;
    return new Vector3(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    );
  }

  const startSpherical = toSpherical(start);
  const transitionSpherical = transitionPosition
    ? toSpherical(transitionPosition)
    : null;
  const endSpherical = toSpherical(targetPosition);

  const pointsToTransition = [];
  const pointsToEnd = [];

  // let numPointsToTransition = 100; // Số điểm từ bắt đầu đến transition
  let numPointsToEnd = 0; // Số điểm từ transition đến điểm đích, thay đổi giá trị này để điều chỉnh tốc độ
  switch (numPoints) {
    case 400:
      numPointsToEnd = 80;
      break;
    case 200:
      numPointsToEnd = 30;
      break;
    case 100:
      numPointsToEnd = 10;
      break;
    default:
      numPointsToEnd = 80;
      break;
  }
  if (transitionSpherical) {
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const intermediateSpherical = {
        radius: radius + 1.5,
        theta: startSpherical.theta * (1 - t) + transitionSpherical.theta * t,
        phi: startSpherical.phi * (1 - t) + transitionSpherical.phi * t,
      };
      pointsToTransition.push(toCartesian(intermediateSpherical));
    }
  }

  for (let i = 0; i <= numPointsToEnd; i++) {
    const t = i / numPointsToEnd;
    const intermediateSpherical = {
      radius: radius + 1.5,
      theta:
        (transitionSpherical
          ? transitionSpherical.theta
          : startSpherical.theta) *
          (1 - t) +
        endSpherical.theta * t,
      phi:
        (transitionSpherical ? transitionSpherical.phi : startSpherical.phi) *
          (1 - t) +
        endSpherical.phi * t,
    };
    pointsToEnd.push(toCartesian(intermediateSpherical));
  }

  let index = 0;
  isPlaneMoving = true; // Đặt cờ khi bắt đầu di chuyển

  const animateToTransition = () => {
    if (index < pointsToTransition.length) {
      plane.position.copy(pointsToTransition[index]);

      if (index > 0) {
        const prevPoint = pointsToTransition[index - 1];
        const direction = pointsToTransition[index]
          .clone()
          .sub(prevPoint)
          .normalize();
        const quaternion = new Quaternion().setFromUnitVectors(
          new Vector3(0, 1, 0),
          direction
        );
        plane.setRotationFromQuaternion(quaternion);
      }

      updateSmokeTrail(
        smokeTrail,
        plane.position,
        pointsToTransition[index].clone().sub(plane.position)
      );

      index++;
      requestAnimationFrame(animateToTransition);
    } else {
      index = 0; // Reset lại chỉ số cho phần tiếp theo
      setTimeout(animateToEnd, 0); // Dừng lại trong 2 giây tại điểm chuyển tiếp
    }
  };

  const animateToEnd = () => {
    if (index < pointsToEnd.length) {
      plane.position.copy(pointsToEnd[index]);

      if (index > 0) {
        const prevPoint = pointsToEnd[index - 1];
        const direction = pointsToEnd[index].clone().sub(prevPoint).normalize();
        const quaternion = new Quaternion().setFromUnitVectors(
          new Vector3(0, 1, 0),
          direction
        );
        plane.setRotationFromQuaternion(quaternion);
      }

      updateSmokeTrail(
        smokeTrail,
        plane.position,
        pointsToEnd[index].clone().sub(plane.position)
      );

      index++;
      requestAnimationFrame(animateToEnd);
    } else {
      scene.remove(smokeTrail);
      sound.stop(); // Dừng âm thanh khi hoàn thành di chuyển
      console.log("Hoàn thành di chuyển máy bay");
      plane.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
      isPlaneMoving = false; // Đặt cờ khi kết thúc di chuyển
    }
  };

  if (transitionSpherical) {
    animateToTransition();
  } else {
    animateToEnd();
  }
}

function updateSmokeTrail(trail, position, velocity) {
  const positions = trail.geometry.attributes.position.array;
  const length = positions.length / 3;
  const randomnessFactor = 0.1;

  for (let i = length - 1; i > 0; i--) {
    positions[i * 3] =
      positions[(i - 1) * 3] + (Math.random() - 0.5) * randomnessFactor;
    positions[i * 3 + 1] =
      positions[(i - 1) * 3 + 1] + (Math.random() - 0.5) * randomnessFactor;
    positions[i * 3 + 2] =
      positions[(i - 1) * 3 + 2] + (Math.random() - 0.5) * randomnessFactor;
  }

  positions[0] =
    position.x - velocity.x * 2 + (Math.random() - 0.5) * randomnessFactor;
  positions[1] =
    position.y - velocity.y * 2 + (Math.random() - 0.5) * randomnessFactor;
  positions[2] =
    position.z - velocity.z * 2 + (Math.random() - 0.5) * randomnessFactor;

  trail.geometry.attributes.position.needsUpdate = true;
}

function nr() {
  return Math.random() * 2 - 1;
}

function createSmokeTrail() {
  let geometry = new BufferGeometry();
  let vertices = [];

  for (let i = 0; i < 100; i++) {
    vertices.push(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
  }

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  let material = new PointsMaterial({ size: 0.5, color: 0xaaaaaa });

  return new Points(geometry, material);
}

export function selectSpeed(element) {
  var siblings = element.parentNode.children;
  let speed = element.querySelector("p").innerHTML;
  speed = speed.split("<");
  speed = speed[1].split(">")[1];
  switch (speed) {
    case "1x":
      numPoints = 400;
      break;
    case "2x":
      numPoints = 200;
      break;
    case "3x":
      numPoints = 100;
      break;
    default:
      numPoints = 400;
  }
  for (var i = 0; i < siblings.length; i++) {
    siblings[i].classList.remove("selected");
  }
  element.classList.add("selected");
}

// Đăng ký hàm làm global function
window.selectSpeed = selectSpeed;
window.startFlight = startFlight;

function updateFlightInformation(info) {
  const flightInfoDiv = document.querySelector("#planePopup .innerDiv");

  // Clear existing flight info
  flightInfoDiv.innerHTML = `
    <p>Flight information</p>
  `;

  // Update flight info with new data
  flightInfoDiv.innerHTML += `
    <div class="flight-info">
      <img src="assets/start.png" alt="start" />
      <div><span>From</span><br />${info.from}</div>
    </div>
    <div class="flight-info">
      <img src="assets/transition.png" alt="transition" />
      <div>
            <span>Transition</span><br />
            ${info.transition}
          </div>
    </div>
    <div class="flight-info">
      <img src="assets/end.png" alt="end" />
      <div><span>To</span><br />${info.to}</div>
    </div>
    <div class="flight-info">
      <img src="assets/distance.png" alt="distance" />
      <div>${info.distance}<span> Km</span></div>
    </div>
    <div class="flight-info">
      <img src="assets/clock-icon-symbol-sign-vector.jpg" alt="clock" />
      <div>${info.duration}<span> Hrs</span></div>
    </div>
    <div class="flight-info">
      <button onclick="startFlight()"><b>Start</b></button>
    </div>
  `;
}

function calDistance([x0, y0, z0], [x1, y1, z1]) {
  return Math.hypot(x1 - x0, y1 - y0, z1 - z0);
}

// Thêm hàm startFlight
let currentTransitionPosition = null;
export function startFlight() {
  if (selectedPlane && targetPosition) {
    if (currentTransition && currentTransition.transition) {
      currentTransitionPosition = currentTransition.transition.position;
    } else {
      currentTransitionPosition = null;
    }
    console.log("current trans : ", currentTransitionPosition);

    if (currentTransitionPosition) {
      animatePlaneMovement(
        selectedPlane,
        currentTransitionPosition,
        targetPosition
      );
    } else {
      console.log("enter transition null");
      animatePlaneMovement(selectedPlane, null, targetPosition);
    }

    selectedPlane = null; // Reset sau khi di chuyển
    targetPosition = null; // Reset sau khi di chuyển
    currentTransition.transition.position = null; // Reset sau khi di chuyển
  } else {
    console.log("Plane or target position not selected");
  }
}

function ringScene() {
  ring1.rotation.x = ring1.rotation.x * 0.95 + mousePos.y * 0.05 * 1.2;
  ring1.rotation.y = ring1.rotation.y * 0.95 + mousePos.x * 0.05 * 1.2;

  ring2.rotation.x = ring2.rotation.x * 0.95 + mousePos.y * 0.05 * 0.375;
  ring2.rotation.y = ring2.rotation.y * 0.95 + mousePos.x * 0.05 * 0.375;

  ring3.rotation.x = ring3.rotation.x * 0.95 - mousePos.y * 0.05 * 0.275;
  ring3.rotation.y = ring3.rotation.y * 0.95 - mousePos.x * 0.05 * 0.275;
}
