import "./style.css";
import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

const container = document.getElementById("scene");
if (!container) {
  throw new Error("Missing #scene element");
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x0b0f14, 0);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0f14, 18, 140);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  240
);
camera.position.set(0, 18, 52);

const hemiLight = new THREE.HemisphereLight(0xbad7ff, 0x101820, 0.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffb48a, 1.2);
keyLight.position.set(-24, 28, 12);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x24d4cc, 0.7);
rimLight.position.set(22, 18, -26);
scene.add(rimLight);

const world = new THREE.Group();
scene.add(world);

const terrainGeometry = new THREE.PlaneGeometry(180, 180, 180, 180);
terrainGeometry.rotateX(-Math.PI / 2);
const terrainMaterial = new THREE.MeshStandardMaterial({
  color: 0x0f232b,
  roughness: 0.78,
  metalness: 0.12,
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.position.y = -6;
world.add(terrain);

const positionAttribute = terrainGeometry.attributes.position as THREE.BufferAttribute;
const positions = positionAttribute.array as Float32Array;
const baseHeights = new Float32Array(positionAttribute.count);
const xz = new Float32Array(positionAttribute.count * 2);

for (let i = 0; i < positionAttribute.count; i++) {
  const index = i * 3;
  baseHeights[i] = positions[index + 1];
  xz[i * 2] = positions[index];
  xz[i * 2 + 1] = positions[index + 2];
}

const noise = new ImprovedNoise();
const terrainScale = 0.06;
const terrainHeight = 4.6;
const waveHeight = 1.2;

const monolithGeometry = new THREE.BoxGeometry(1, 1, 1);
const monolithMaterial = new THREE.MeshStandardMaterial({
  color: 0x1d3a46,
  roughness: 0.35,
  metalness: 0.6,
});
const monoliths = new THREE.InstancedMesh(monolithGeometry, monolithMaterial, 46);
const dummy = new THREE.Object3D();

for (let i = 0; i < monoliths.count; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 18 + Math.random() * 58;
  const height = 3 + Math.random() * 14;
  dummy.position.set(
    Math.cos(angle) * radius,
    -6 + height * 0.5,
    Math.sin(angle) * radius
  );
  dummy.scale.set(1.2 + Math.random() * 1.8, height, 1.2 + Math.random() * 1.8);
  dummy.rotation.y = Math.random() * Math.PI;
  dummy.updateMatrix();
  monoliths.setMatrixAt(i, dummy.matrix);
}
monoliths.instanceMatrix.needsUpdate = true;
world.add(monoliths);

const starCount = 900;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const radius = 90 + Math.random() * 80;
  const theta = Math.random() * Math.PI * 2;
  const y = 22 + Math.random() * 46;
  starPositions[i * 3] = Math.cos(theta) * radius;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = Math.sin(theta) * radius;
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0x9ad7ff,
  size: 0.6,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.7,
});
const stars = new THREE.Points(starGeometry, starMaterial);
world.add(stars);

const orbitGroup = new THREE.Group();
const orbitCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.4, 1),
  new THREE.MeshStandardMaterial({
    color: 0xffb48a,
    emissive: 0xff6a3d,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.6,
  })
);
orbitGroup.add(orbitCore);

const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0x25d4cc,
  emissive: 0x25d4cc,
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.8,
  roughness: 0.2,
  metalness: 0.4,
});
const ringGeometry = new THREE.TorusGeometry(5.6, 0.12, 16, 160);
const ringA = new THREE.Mesh(ringGeometry, ringMaterial);
const ringB = ringA.clone();
ringB.rotation.x = Math.PI / 2.5;
const ringC = new THREE.Mesh(
  new THREE.TorusGeometry(3.8, 0.08, 16, 140),
  new THREE.MeshStandardMaterial({
    color: 0xff9565,
    emissive: 0xff6a3d,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.5,
  })
);
ringC.rotation.y = Math.PI / 2.8;
orbitGroup.add(ringA, ringB, ringC);

const satelliteMaterial = new THREE.MeshStandardMaterial({
  color: 0x9ad7ff,
  emissive: 0x9ad7ff,
  emissiveIntensity: 0.6,
  roughness: 0.3,
  metalness: 0.4,
});
const satellites: THREE.Mesh[] = [];
for (let i = 0; i < 4; i++) {
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 18, 18),
    satelliteMaterial
  );
  orbitGroup.add(satellite);
  satellites.push(satellite);
}

orbitGroup.position.set(-14, 8, 6);
world.add(orbitGroup);

const beaconGroup = new THREE.Group();
const beaconGeometry = new THREE.ConeGeometry(0.7, 3.2, 12);
const beaconMaterials: THREE.MeshStandardMaterial[] = [];
const beaconCount = 9;
for (let i = 0; i < beaconCount; i++) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x1d3a46,
    emissive: 0x25d4cc,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.5,
    transparent: true,
    opacity: 0.9,
  });
  const beacon = new THREE.Mesh(beaconGeometry, material);
  const angle = (i / beaconCount) * Math.PI * 2;
  const radius = 22 + Math.random() * 18;
  const heightScale = 0.7 + Math.random() * 1.4;
  beacon.scale.set(1, heightScale, 1);
  beacon.position.set(
    Math.cos(angle) * radius,
    -6 + (3.2 * heightScale) / 2,
    Math.sin(angle) * radius
  );
  beaconGroup.add(beacon);
  beaconMaterials.push(material);
}
world.add(beaconGroup);

const signalPoints: THREE.Vector3[] = [];
const signalCount = 60;
for (let i = 0; i < signalCount; i++) {
  const t = i / (signalCount - 1);
  const angle = t * Math.PI * 2;
  const radius = 24 + Math.sin(t * Math.PI * 4) * 4;
  signalPoints.push(
    new THREE.Vector3(
      Math.cos(angle) * radius,
      2 + Math.sin(t * Math.PI * 2) * 3,
      Math.sin(angle) * radius
    )
  );
}
const signalMaterial = new THREE.LineBasicMaterial({
  color: 0x25d4cc,
  transparent: true,
  opacity: 0.35,
});
const signalPath = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(signalPoints),
  signalMaterial
);
world.add(signalPath);

const droneGroup = new THREE.Group();
const droneGeometry = new THREE.IcosahedronGeometry(0.7, 0);
const droneMaterial = new THREE.MeshStandardMaterial({
  color: 0x9ad7ff,
  emissive: 0x9ad7ff,
  emissiveIntensity: 0.5,
  roughness: 0.25,
  metalness: 0.4,
});
const drones: THREE.Mesh[] = [];
const droneCount = 10;
for (let i = 0; i < droneCount; i++) {
  const drone = new THREE.Mesh(droneGeometry, droneMaterial);
  const angle = (i / droneCount) * Math.PI * 2;
  const radius = 12 + Math.random() * 8;
  drone.position.set(
    Math.cos(angle) * radius,
    4 + Math.random() * 6,
    Math.sin(angle) * radius
  );
  droneGroup.add(drone);
  drones.push(drone);
}
world.add(droneGroup);

const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();

window.addEventListener("pointermove", (event) => {
  pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener("mouseleave", () => {
  pointerTarget.set(0, 0);
});

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;

const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
let revealObserver: IntersectionObserver | null = null;

const showRevealTargets = () => {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
};

const setupRevealObserver = () => {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  if (reducedMotion) {
    showRevealTargets();
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  revealTargets.forEach((target) => revealObserver?.observe(target));
};

motionQuery.addEventListener("change", (event) => {
  reducedMotion = event.matches;
  setupRevealObserver();
});

type InlineScene = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (time: number, scrollT: number, reduced: boolean) => void;
  resize: () => void;
  observer: ResizeObserver;
};

const inlineScenes: InlineScene[] = [];

const createInlineScene = (root: HTMLElement) => {
  const canvas = document.createElement("canvas");
  canvas.className = "inline-canvas";
  root.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xbad7ff, 0.7));
  const key = new THREE.DirectionalLight(0xffb48a, 1.1);
  key.position.set(4, 6, 8);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  let update: InlineScene["update"];
  const variant = root.dataset.scene ?? "orbit";

  if (variant === "prism") {
    const prism = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.6, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x1d3a46,
        emissive: 0x25d4cc,
        emissiveIntensity: 0.45,
        roughness: 0.28,
        metalness: 0.6,
      })
    );
    const prismEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(prism.geometry),
      new THREE.LineBasicMaterial({
        color: 0x9ad7ff,
        transparent: true,
        opacity: 0.7,
      })
    );
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.45, 3.2, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffb48a,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7,
      })
    );
    spine.position.y = -0.1;
    group.add(prism, prismEdges, spine);

    update = (time, scrollT, reduced) => {
      const t = reduced ? 0 : time;
      group.rotation.y = t * 0.5 + scrollT * 1.2;
      group.rotation.x = t * 0.3 + scrollT * 0.4;
      spine.rotation.y = t * 0.8;
    };
  } else if (variant === "flow") {
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.4, 0.35, 120, 16),
      new THREE.MeshStandardMaterial({
        color: 0x25d4cc,
        emissive: 0x25d4cc,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.45,
      })
    );
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 2.6, 48),
      new THREE.MeshStandardMaterial({
        color: 0xff9565,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      })
    );
    halo.rotation.x = Math.PI / 2;
    group.add(knot, halo);

    update = (time, scrollT, reduced) => {
      const t = reduced ? 0 : time;
      group.rotation.x = t * 0.4 + scrollT * 0.8;
      group.rotation.y = t * 0.6 + scrollT * 1.1;
      halo.rotation.z = t * 0.5;
    };
  } else {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffb48a,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.55,
        roughness: 0.22,
        metalness: 0.4,
      })
    );
    const orbitMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ad7ff,
      emissive: 0x9ad7ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.75,
      roughness: 0.25,
      metalness: 0.35,
    });
    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.08, 16, 80),
      orbitMaterial
    );
    const orbitRingTwo = orbitRing.clone();
    orbitRing.rotation.x = Math.PI / 2.2;
    orbitRingTwo.rotation.y = Math.PI / 2.4;
    group.add(core, orbitRing, orbitRingTwo);

    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const satellite = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        orbitMaterial
      );
      group.add(satellite);
      satellites.push(satellite);
    }

    update = (time, scrollT, reduced) => {
      const t = reduced ? 0 : time;
      group.rotation.y = t * 0.6 + scrollT * 1.3;
      group.rotation.x = t * 0.2 - scrollT * 0.3;
      satellites.forEach((satellite, index) => {
        const angle = t * 0.8 + index * (Math.PI / 2);
        satellite.position.x = Math.cos(angle) * 2.8;
        satellite.position.z = Math.sin(angle) * 2.8;
        satellite.position.y = Math.sin(t * 0.6 + index) * 0.8;
      });
    };
  }

  const resize = () => {
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(root);
  resize();

  inlineScenes.push({
    renderer,
    scene,
    camera,
    update,
    resize,
    observer,
  });
};

document
  .querySelectorAll<HTMLElement>(".inline-3d")
  .forEach((target) => createInlineScene(target));

const scrollState = {
  current: 0,
  target: 0,
};

const getScrollProgress = () => {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - doc.clientHeight);
  return doc.scrollTop / maxScroll;
};

const updateScrollTarget = () => {
  scrollState.target = getScrollProgress();
};

updateScrollTarget();

window.addEventListener("scroll", updateScrollTarget, { passive: true });

let lastNormalUpdate = 0;
const clock = new THREE.Clock();

const updateTerrain = (time: number, heightScale: number, waveScale: number) => {
  const offset = time * 0.6;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = xz[i * 2];
    const z = xz[i * 2 + 1];
    const n = noise.noise(
      x * terrainScale + offset * 0.15,
      z * terrainScale + offset * 0.12,
      offset * 0.08
    );
    const wave =
      Math.sin(x * 0.05 + offset * 1.2) +
      Math.cos(z * 0.04 - offset * 1.05);
    positions[i * 3 + 1] =
      baseHeights[i] +
      n * terrainHeight * heightScale +
      wave * waveHeight * waveScale;
  }

  positionAttribute.needsUpdate = true;

  if (time - lastNormalUpdate > 0.22) {
    terrainGeometry.computeVertexNormals();
    lastNormalUpdate = time;
  }
};

updateTerrain(0, 1, 1);
setupRevealObserver();

const animate = () => {
  const elapsed = clock.getElapsedTime();
  pointer.lerp(pointerTarget, 0.06);
  scrollState.current += (scrollState.target - scrollState.current) * 0.08;
  const scrollT = scrollState.current;
  const scrollWave = Math.sin(scrollT * Math.PI * 2);
  const drift = reducedMotion ? 0 : elapsed;

  if (!reducedMotion) {
    const terrainAmp = THREE.MathUtils.lerp(0.7, 1.35, scrollT);
    const waveAmp = THREE.MathUtils.lerp(0.6, 1.4, scrollT);
    updateTerrain(elapsed, terrainAmp, waveAmp);
  }

  const cameraOrbit = 0.18 + scrollT * 0.2;
  camera.position.x = pointer.x * 6 + Math.sin(drift * cameraOrbit) * 12 + scrollWave * 4;
  camera.position.y = 16 + pointer.y * -3 + Math.sin(drift * 0.25) * 1.8 + scrollT * 6;
  camera.position.z = 48 + Math.cos(drift * 0.15) * 6 - scrollT * 12;
  camera.lookAt(0, 4 + scrollT * 6, 0);

  world.position.y = -scrollT * 6;
  world.rotation.y = Math.sin(drift * 0.08) * 0.04 + scrollT * 0.35;
  stars.rotation.y += 0.0006 + scrollT * 0.0008;

  const orbitTime = drift * 0.6 + scrollT * 1.4;
  orbitGroup.rotation.y = orbitTime;
  orbitGroup.rotation.x = drift * 0.15 - scrollT * 0.25;
  orbitGroup.position.x = -14 + scrollT * 6;
  orbitGroup.position.y = 8 + Math.sin(drift * 0.6) * 1.2 + scrollT * 6;
  orbitGroup.position.z = 6 - scrollT * 18;
  satellites.forEach((satellite, index) => {
    const angle = orbitTime + index * (Math.PI / 2);
    satellite.position.x = Math.cos(angle) * 4.2;
    satellite.position.z = Math.sin(angle) * 4.2;
    satellite.position.y = Math.sin(drift * 0.9 + index) * 1.2;
  });

  droneGroup.rotation.y = drift * 0.3 + scrollT * 0.5;
  drones.forEach((drone, index) => {
    const phase = drift * 1.1 + index;
    drone.position.y = 3.5 + Math.sin(phase) * 1.6 + scrollT * 2;
    drone.rotation.x = drift * 0.6 + index;
    drone.rotation.z = drift * 0.4;
  });

  beaconMaterials.forEach((material, index) => {
    const pulse = 0.4 + 0.4 * (0.5 + Math.sin(drift * 1.4 + index));
    material.emissiveIntensity = pulse + scrollT * 0.35;
  });

  signalPath.rotation.y = drift * 0.2 + scrollT * 0.6;
  signalPath.position.y = 1 + Math.sin(drift * 0.4) * 0.6 + scrollT * 3;
  signalMaterial.opacity = 0.25 + scrollT * 0.35;

  if (scene.fog && scene.fog instanceof THREE.Fog) {
    scene.fog.near = 18 + scrollT * 6;
    scene.fog.far = 140 - scrollT * 18;
  }

  renderer.render(scene, camera);
  inlineScenes.forEach((item) => {
    item.update(elapsed, scrollT, reducedMotion);
    item.renderer.render(item.scene, item.camera);
  });
  requestAnimationFrame(animate);
};

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  inlineScenes.forEach((item) => {
    item.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    item.resize();
  });
  updateScrollTarget();
});
