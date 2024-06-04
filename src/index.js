// import libraries
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
} from "https://cdn.skypack.dev/three@0.137";
import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import anime from "https://cdn.skypack.dev/animejs@3.2.1";

//declare the background
let sunBackground = document.querySelector(".sun-background");
let moonBackground = document.querySelector(".moon-background");

//set up the scene
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

//move the scene around
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

//set up the sun
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

//set up the moon
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

// // Create a helper for the shadow camera (optional)
// const helper = new CameraHelper( light.shadow.camera );
// scene.add( helper );

let mousePos = new Vector2(0, 0);

window.addEventListener("mousemove", (e) => {
  let x = e.clientX - innerWidth * 0.5;
  let y = e.clientY - innerHeight * 0.5;

  mousePos.x = x * 0.0003;
  mousePos.y = y * 0.0003;
});

let moon;
let moonMaterial;
(async function () {
  let pmrem = new PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(FloatType)
    .loadAsync("assets/old_room_2k.hdr"); // thanks to https://polyhaven.com/hdris !
  let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

  const ring1 = new Mesh(
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

  const ring2 = new Mesh(
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

  const ring3 = new Mesh(
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
    // thanks to https://free3d.com/user/ali_alkendi !
    bump: await new TextureLoader().loadAsync("assets/earthbump.jpg"),
    map: await new TextureLoader().loadAsync("assets/earthmap.jpg"),
    spec: await new TextureLoader().loadAsync("assets/earthspec.jpg"),
    moonTexture: await new TextureLoader().loadAsync(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg"
    ),
    planeTrailMask: await new TextureLoader().loadAsync("assets/mask.png"),
  };

  //create planes fly around earth
  // "Cartoon Plane" (https://skfb.ly/UOLT) by antonmoek
  let plane = (await new GLTFLoader().loadAsync("assets/plane/scene.glb")).scene
    .children[0];
  let planesData = [
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    // makePlane(plane, textures.planeTrailMask, envMap, scene),
    // makePlane(plane, textures.planeTrailMask, envMap, scene),
    // makePlane(plane, textures.planeTrailMask, envMap, scene),
    // makePlane(plane, textures.planeTrailMask, envMap, scene),
  ];

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

  // Load model tên lửa
  let rocket;
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("assets/plane/satelite.glb", (gltf) => {
    rocket = gltf.scene;
    rocket.scale.set(0.35, 0.35, 0.35); // Đặt kích thước cho model tên lửa

    // Đặt vị trí tên lửa lên trên bề mặt của địa cầu
    let rocketPosition = new Vector3(0, 12, 0); // Đặt vị trí ban đầu của tên lửa (x, y, z)
    rocketPosition.add(sphere.position); // Cộng với vị trí của địa cầu để đặt tên lửa lên trên địa cầu
    rocket.position.copy(rocketPosition);

    scene.add(rocket); // Thêm tên lửa vào scene
    rocket.addEventListener("click", () => {
      console.log("Bạn đã click vào tên lửa!");
    });

    // Thêm sự kiện click vào renderer
    renderer.domElement.addEventListener("click", (event) => {
      event.preventDefault();
      // Tính toán vị trí chuột trên màn hình
      let mouse = new Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Tạo một raycaster từ vị trí chuột và camera
      let raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Tìm các đối tượng được chạm bởi raycaster (trong trường hợp này là mặt đất)
      let intersects = raycaster.intersectObjects([sphere]); // Đặt đối tượng mà raycaster có thể chạm vào (trong trường hợp này là địa cầu)

      // Nếu có đối tượng được chạm và biến rocket đã được khởi tạo
      if (intersects.length > 0 && rocket) {
        // Lấy vị trí của điểm chạm trên địa cầu
        let targetPosition = intersects[0].point;
        // Di chuyển máy bay đến vị trí này
        anime({
          targets: rocket.position,
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          easing: "easeInOutQuad", // Đặt kiểu easing theo ý muốn
          duration: 2000, // Thời gian di chuyển (milliseconds)
        });
      }
    });

    // Tạo một SphereGeometry mới cho mặt trăng
    const moonGeometry = new SphereGeometry(8, 64, 64);
    // Tạo một MeshPhysicalMaterial cho mặt trăng, có thể tùy chỉnh theo ý muốn
    moonMaterial = new MeshPhysicalMaterial({
      color: new Color("#d4d4d4").convertSRGBToLinear(), // Màu của mặt trăng
      roughness: 0.2, // Độ nhám
      // envMap, // Sử dụng envMap của scene chính
      envMapIntensity: 1, // Cường độ của envMap
      map: textures.moonTexture,
    });
    // Tạo mesh cho mặt trăng sử dụng geometry và material đã tạo
    moon = new Mesh(moonGeometry, moonMaterial);
    // Đặt vị trí của mặt trăng kế bên trái địa cầu
    moon.position.set(-30, 0, 0); // Điều chỉnh vị trí theo cần thiết
    // Thêm mặt trăng vào scene
    scene.add(moon);
  });

  let clock = new Clock();

  let daytime = true;
  let animating = false;
  let isNight = false;
  //thay đổi ngày sang đêm và ngược lại
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
        console.log("thay đổi ngày sang đêm");
        sunLight.position.setY(20 * (1 - obj.t));
        moonLight.position.setY(20 * obj.t);

        // const minMoonIntensity = 1;
        // moonMaterial.envMapIntensity=minMoonIntensity;
        console.log(moonMaterial);

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

        ringsScene.children.forEach((child, i) => {
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
  //loop every frames
  renderer.setAnimationLoop(() => {
    let delta = clock.getDelta();
    if (rocket) {
      let rocketPosition = new Vector3(5, 2, 0); // Đặt vị trí ban đầu của tên lửa (x, y, z)
      rocketPosition.add(sphere.position); // Cộng với vị trí của địa cầu để đặt tên lửa lên trên địa cầu
      rocket.position.copy(rocketPosition);
      rocket.addEventListener("click", () => {
        alert(`Bạn đã click vào máy bay `);
      });
    }

    if (moon) {
      const moonRotationSpeed = 0.2; // Tốc độ quay của mặt trăng, có thể điều chỉnh
      moon.rotation.y += delta * moonRotationSpeed; // Delta là thời gian giữa các frame

      // Đặt vị trí của mặt trăng quay quanh Trái Đất
      const distanceFromEarth = 30; // Khoảng cách giữa Trái Đất và mặt trăng
      const moonOrbitRadius = 50; // Bán kính quỹ đạo của mặt trăng quanh Trái Đất, có thể điều chỉnh
      const moonOrbitSpeed = 0.3; // Tốc độ quay quanh Trái Đất, có thể điều chỉnh
      const moonOrbitAngle = delta * moonOrbitSpeed; // Góc quay của mặt trăng quanh Trái Đất
      const cosAngle = Math.cos(moonOrbitAngle);
      const sinAngle = Math.sin(moonOrbitAngle);
      newX = moon.position.x * cosAngle - moon.position.z * sinAngle;
      newZ = moon.position.x * sinAngle + moon.position.z * cosAngle;
      moon.position.set(newX, 0, newZ);
      // console.log(moonMaterial.map);
      moonMaterial.color = new Color("#d4d4d4").convertSRGBToLinear();
    }

    //set position for each plane
    planesData.forEach((planeData) => {
      let plane = planeData.group;
      earthRotation += delta * 0.1; // Adjust the rotation speed as needed
      // Điều chỉnh tốc độ quay theo ý muốn

      plane.position.set(0, 0, 0);
      plane.rotation.set(0, 0, 0);
      plane.updateMatrixWorld();

      //planeData.rot += delta * 0.25; ----> adjust to stand or move
      // plane.rotateOnAxis(planeData.randomAxis, planeData.randomAxisRot); // random axis

      // plane.rotateOnAxis(new Vector3(0, 1, 0), planeData.rot); // y-axis rotation
      // plane.rotateOnAxis(new Vector3(0, 0, 1), planeData.rad); // this decides the radius
      //-> to fix the initial position =>
      plane.rotateOnAxis(new Vector3(0, 1, 0), 5); // y-axis rotation
      plane.rotateOnAxis(new Vector3(0, 0, 1), 5); // this decides the radius
      plane.translateY(planeData.yOff);
      plane.rotateOnAxis(new Vector3(1, 0, 0), +Math.PI * 0.5);
      sphere.rotation.y = earthRotation;
    });
    controls.update();
    renderer.render(scene, camera);

    ring1.rotation.x = ring1.rotation.x * 0.95 + mousePos.y * 0.05 * 1.2;
    ring1.rotation.y = ring1.rotation.y * 0.95 + mousePos.x * 0.05 * 1.2;

    ring2.rotation.x = ring2.rotation.x * 0.95 + mousePos.y * 0.05 * 0.375;
    ring2.rotation.y = ring2.rotation.y * 0.95 + mousePos.x * 0.05 * 0.375;

    ring3.rotation.x = ring3.rotation.x * 0.95 - mousePos.y * 0.05 * 0.275;
    ring3.rotation.y = ring3.rotation.y * 0.95 - mousePos.x * 0.05 * 0.275;

    renderer.autoClear = false;
    renderer.render(ringsScene, ringsCamera);
    renderer.autoClear = true;
  });
})();

// Biến toàn cục để theo dõi máy bay được chọn
let selectedPlane = null;
// Sửa đổi hàm makePlane để có thể nhận biết được khi máy bay được nhấn
function makePlane(planeMesh, trailTexture, envMap, scene) {
  let plane = planeMesh.clone();
  let planeSize = 0.003;
  plane.scale.set(planeSize, planeSize, planeSize);
  plane.position.set(0, 0, 0);
  plane.rotation.set(0, 0, 0);
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

  group.userData.isPlane = true; // Đánh dấu là máy bay

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

// Sự kiện nhấn chuột để chọn máy bay hoặc di chuyển máy bay được chọn
renderer.domElement.addEventListener("click", function (event) {
  event.preventDefault();

  let mouse = new Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  // Initialize raycaster with the current mouse and camera position
  let raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Calculate intersections with objects in the scene
  let intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    let intersectedObject = intersects[0].object;

    // Check if the clicked object is a plane
    if (intersectedObject.parent && intersectedObject.parent.userData.isPlane) {
      // Select the plane if no plane is currently selected
      if (!selectedPlane) {
        selectedPlane = intersectedObject.parent;
        console.log("Plane selected:", selectedPlane);
      }
    } else if (selectedPlane) {
      let targetPosition = intersects[0].point;
      animatePlaneMovement(selectedPlane, targetPosition);
      selectedPlane = null;
    }
  }
});

// Hàm di chuyển máy bay đến vị trí mới
function animatePlaneMovement(plane, targetPosition) {
  // Khởi tạo hiệu ứng động cơ phát sáng và dấu vết khói
  let engineGlow = createEngineGlow();
  let smokeTrail = createSmokeTrail();
  plane.add(engineGlow);
  scene.add(smokeTrail);

  anime({
    targets: plane.position,
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    easing: "easeInOutQuad",
    duration: 2000,
    update: function () {
      // Cập nhật vị trí máy bay
      plane.position.x += 0.1; // Ví dụ di chuyển máy bay
      plane.position.y += 0.1; // Ví dụ di chuyển máy bay

      // Di chuyển engine glow cùng với máy bay
      if (plane.engineGlow) {
        plane.engineGlow.position.copy(plane.position);
        plane.engineGlow.position.z -= 2; // Giữ engine glow phía sau máy bay
      }

      // Cập nhật renderer
      renderer.render(scene, camera);
      updateSmokeTrail(smokeTrail, plane.position);
    },
    complete: function () {
      plane.remove(engineGlow);
      scene.remove(smokeTrail);

      console.log("Hoàn thành di chuyển máy bay");
    },
  });
}

function createEngineGlow() {
  // Đảm bảo rằng bạn có một hình ảnh phù hợp cho động cơ phát sáng, ví dụ 'engine_glow.png'
  const textureLoader = new TextureLoader();
  const glowTexture = textureLoader.load(""); // thay thế 'path_to_glow_effect_image.png' với đường dẫn chính xác

  const spriteMaterial = new SpriteMaterial({
    map: glowTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
  });

  const sprite = new Sprite(spriteMaterial);
  sprite.scale.set(2, 2, 2); // Kích thước phù hợp
  sprite.position.set(0, 0, -2); // Vị trí phía sau máy bay
  return sprite;
}

function nr() {
  return Math.random() * 2 - 1;
}

// Hàm xử lý khi click vào máy bay
function handlePlaneClick() {
  alert("Bạn đã click vào máy bay!");
}
function updateSmokeTrail(trail, position) {
  trail.geometry.attributes.position.needsUpdate = true; // Important to update positions
  trail.position.copy(position);
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

// Hàm xử lý khi click vào vệ tinh
function handleSatelliteClick() {
  alert("Bạn đã click vào vệ tinh!");
}
function animatePlaneAlongCurve(plane, startPosition, endPosition, earthRadius) {
    let curve = new THREE.QuadraticBezierCurve3(
        startPosition,
        new THREE.Vector3(0, earthRadius + 10, 0),  // Điểm giữa nâng cao để tạo độ cong
        endPosition
    );

    let points = curve.getPoints(50);  // Tạo 50 điểm trên đường cong
    let index = 0;

    function movePlane() {
        if (index < points.length) {
            plane.position.copy(points[index]);
            index++;
            requestAnimationFrame(movePlane);  // Tiếp tục di chuyển máy bay trên đường cong
        }
    }

    movePlane();  // Bắt đầu di chuyển máy bay
}
