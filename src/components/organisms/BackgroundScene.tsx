import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, Group, InstancedMesh, Mesh, Points } from "three";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointsMaterial,
  Vector2,
  Vector3,
} from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import type { ScrollState } from "../../types/scroll";

type BackgroundSceneProps = {
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
};

const terrainScale = 0.06;
const terrainHeight = 4.6;
const waveHeight = 1.2;

const BackgroundScene = ({
  reducedMotion,
  scrollRef,
  isMobile,
}: BackgroundSceneProps) => {
  const { camera } = useThree();
  const worldRef = useRef<Group>(null);
  const starsRef = useRef<Points>(null);
  const orbitGroupRef = useRef<Group>(null);
  const signalPathRef = useRef<Line>(null);
  const droneGroupRef = useRef<Group>(null);
  const monolithsRef = useRef<InstancedMesh>(null);
  const fogRef = useRef<Fog | null>(null);

  const satellitesRef = useRef<Mesh[]>([]);
  const dronesRef = useRef<Mesh[]>([]);

  const pointer = useRef(new Vector2());
  const pointerTarget = useRef(new Vector2());
  const lastNormalUpdate = useRef(0);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      pointerTarget.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleLeave = () => {
      pointerTarget.current.set(0, 0);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const terrain = useMemo(() => {
    const segments = isMobile ? 120 : 180;
    const geometry = new PlaneGeometry(180, 180, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    const positionAttribute = geometry.attributes.position as BufferAttribute;
    const positions = positionAttribute.array as Float32Array;
    const baseHeights = new Float32Array(positionAttribute.count);
    const xz = new Float32Array(positionAttribute.count * 2);

    for (let i = 0; i < positionAttribute.count; i++) {
      const index = i * 3;
      baseHeights[i] = positions[index + 1];
      xz[i * 2] = positions[index];
      xz[i * 2 + 1] = positions[index + 2];
    }

    return { geometry, positionAttribute, positions, baseHeights, xz };
  }, [isMobile]);

  const terrainMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x0f232b,
        roughness: 0.78,
        metalness: 0.12,
      }),
    []
  );

  const noise = useMemo(() => new ImprovedNoise(), []);

  const monolithsData = useMemo(() => {
    const count = isMobile ? 28 : 46;
    const items: Array<{
      position: Vector3;
      scale: Vector3;
      rotationY: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 18 + Math.random() * 58;
      const height = 3 + Math.random() * 14;
      items.push({
        position: new Vector3(
          Math.cos(angle) * radius,
          -6 + height * 0.5,
          Math.sin(angle) * radius
        ),
        scale: new Vector3(
          1.2 + Math.random() * 1.8,
          height,
          1.2 + Math.random() * 1.8
        ),
        rotationY: Math.random() * Math.PI,
      });
    }

    return items;
  }, [isMobile]);

  const monolithGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const monolithMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x1d3a46,
        roughness: 0.35,
        metalness: 0.6,
      }),
    []
  );

  useEffect(() => {
    if (!monolithsRef.current) {
      return;
    }
    const dummy = new Object3D();
    monolithsData.forEach((item, index) => {
      dummy.position.copy(item.position);
      dummy.scale.copy(item.scale);
      dummy.rotation.y = item.rotationY;
      dummy.updateMatrix();
      monolithsRef.current?.setMatrixAt(index, dummy.matrix);
    });
    monolithsRef.current.instanceMatrix.needsUpdate = true;
  }, [monolithsData]);

  const stars = useMemo(() => {
    const starCount = isMobile ? 520 : 900;
    const geometry = new BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 90 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const y = 22 + Math.random() * 46;
      starPositions[i * 3] = Math.cos(theta) * radius;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = Math.sin(theta) * radius;
    }

    geometry.setAttribute("position", new BufferAttribute(starPositions, 3));
    const material = new PointsMaterial({
      color: 0x9ad7ff,
      size: 0.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    });

    return { geometry, material };
  }, [isMobile]);

  const ringMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x25d4cc,
        emissive: 0x25d4cc,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.4,
      }),
    []
  );

  const orbitMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x9ad7ff,
        emissive: 0x9ad7ff,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.4,
      }),
    []
  );

  const beaconMaterials = useMemo(() => {
    const count = isMobile ? 7 : 9;
    const materials: MeshStandardMaterial[] = [];
    for (let i = 0; i < count; i++) {
      materials.push(
        new MeshStandardMaterial({
          color: 0x1d3a46,
          emissive: 0x25d4cc,
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.5,
          transparent: true,
          opacity: 0.9,
        })
      );
    }
    return materials;
  }, [isMobile]);

  const beacons = useMemo(() => {
    const count = isMobile ? 7 : 9;
    const items: Array<{ angle: number; radius: number; height: number }> = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 22 + Math.random() * 18;
      const heightScale = 0.7 + Math.random() * 1.4;
      items.push({ angle, radius, height: heightScale });
    }

    return items;
  }, [isMobile]);

  const signal = useMemo(() => {
    const points: Vector3[] = [];
    const signalCount = 60;
    for (let i = 0; i < signalCount; i++) {
      const t = i / (signalCount - 1);
      const angle = t * Math.PI * 2;
      const radius = 24 + Math.sin(t * Math.PI * 4) * 4;
      points.push(
        new Vector3(
          Math.cos(angle) * radius,
          2 + Math.sin(t * Math.PI * 2) * 3,
          Math.sin(angle) * radius
        )
      );
    }
    return new BufferGeometry().setFromPoints(points);
  }, []);

  const signalMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: 0x25d4cc,
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  const signalLine = useMemo(() => {
    return new Line(signal, signalMaterial);
  }, [signal, signalMaterial]);

  const droneData = useMemo(() => {
    const items: Array<{ x: number; z: number }> = [];
    const count = isMobile ? 6 : 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 12 + Math.random() * 8;
      items.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      });
    }
    return items;
  }, [isMobile]);

  const updateTerrain = (
    time: number,
    heightScale: number,
    waveScale: number
  ) => {
    const offset = time * 0.6;

    for (let i = 0; i < terrain.positionAttribute.count; i++) {
      const x = terrain.xz[i * 2];
      const z = terrain.xz[i * 2 + 1];
      const n = noise.noise(
        x * terrainScale + offset * 0.15,
        z * terrainScale + offset * 0.12,
        offset * 0.08
      );
      const wave =
        Math.sin(x * 0.05 + offset * 1.2) + Math.cos(z * 0.04 - offset * 1.05);
      terrain.positions[i * 3 + 1] =
        terrain.baseHeights[i] +
        n * terrainHeight * heightScale +
        wave * waveHeight * waveScale;
    }

    terrain.positionAttribute.needsUpdate = true;

    if (time - lastNormalUpdate.current > 0.22) {
      terrain.geometry.computeVertexNormals();
      lastNormalUpdate.current = time;
    }
  };

  const orbitBaseX = isMobile ? 8 : 14;
  const orbitScrollX = isMobile ? 3.5 : 6;

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    pointer.current.lerp(pointerTarget.current, 0.06);

    const scrollState = scrollRef.current;
    scrollState.current += (scrollState.target - scrollState.current) * 0.08;

    const scrollT = scrollState.current;
    const scrollWave = Math.sin(scrollT * Math.PI * 2);
    const drift = reducedMotion ? 0 : elapsed;

    if (!reducedMotion) {
      const terrainAmp = MathUtils.lerp(0.7, 1.35, scrollT);
      const waveAmp = MathUtils.lerp(0.6, 1.4, scrollT);
      updateTerrain(elapsed, terrainAmp, waveAmp);
    }

    const cameraOrbit = 0.18 + scrollT * 0.2;
    camera.position.x =
      pointer.current.x * 6 +
      Math.sin(drift * cameraOrbit) * 12 +
      scrollWave * 4;
    camera.position.y =
      16 + pointer.current.y * -3 + Math.sin(drift * 0.25) * 1.8 + scrollT * 6;
    camera.position.z = 48 + Math.cos(drift * 0.15) * 6 - scrollT * 12;
    camera.lookAt(0, 4 + scrollT * 6, 0);

    if (worldRef.current) {
      worldRef.current.position.y = -scrollT * 6;
      worldRef.current.rotation.y =
        Math.sin(drift * 0.08) * 0.04 + scrollT * 0.35;
    }

    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0006 + scrollT * 0.0008;
    }

    if (orbitGroupRef.current) {
      const orbitTime = drift * 0.6 + scrollT * 1.4;
      orbitGroupRef.current.rotation.y = orbitTime;
      orbitGroupRef.current.rotation.x = drift * 0.15 - scrollT * 0.25;
      orbitGroupRef.current.position.x = orbitBaseX - scrollT * orbitScrollX;
      orbitGroupRef.current.position.y =
        8 + Math.sin(drift * 0.6) * 1.2 + scrollT * 6;
      orbitGroupRef.current.position.z = 6 - scrollT * 18;

      satellitesRef.current.forEach((satellite, index) => {
        const angle = orbitTime + index * (Math.PI / 2);
        satellite.position.x = Math.cos(angle) * 4.2;
        satellite.position.z = Math.sin(angle) * 4.2;
        satellite.position.y = Math.sin(drift * 0.9 + index) * 1.2;
      });
    }

    if (droneGroupRef.current) {
      droneGroupRef.current.rotation.y = drift * 0.3 + scrollT * 0.5;
      dronesRef.current.forEach((drone, index) => {
        const phase = drift * 1.1 + index;
        drone.position.y = 3.5 + Math.sin(phase) * 1.6 + scrollT * 2;
        drone.rotation.x = drift * 0.6 + index;
        drone.rotation.z = drift * 0.4;
      });
    }

    beaconMaterials.forEach((material, index) => {
      const pulse = 0.4 + 0.4 * (0.5 + Math.sin(drift * 1.4 + index));
      material.emissiveIntensity = pulse + scrollT * 0.35;
    });

    if (signalPathRef.current) {
      signalPathRef.current.rotation.y = drift * 0.2 + scrollT * 0.6;
      signalPathRef.current.position.y =
        1 + Math.sin(drift * 0.4) * 0.6 + scrollT * 3;
    }
    signalMaterial.opacity = 0.25 + scrollT * 0.35;

    if (fogRef.current) {
      fogRef.current.near = 18 + scrollT * 6;
      fogRef.current.far = 140 - scrollT * 18;
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[0x0b0f14, 18, 140]} />
      <hemisphereLight args={[0xbad7ff, 0x101820, 0.6]} />
      <directionalLight
        position={[-24, 28, 12]}
        intensity={1.2}
        color={0xffb48a}
      />
      <directionalLight
        position={[22, 18, -26]}
        intensity={0.7}
        color={0x24d4cc}
      />

      <group ref={worldRef}>
        <mesh
          geometry={terrain.geometry}
          material={terrainMaterial}
          position={[0, -6, 0]}
        />

        <instancedMesh
          ref={monolithsRef}
          args={[monolithGeometry, monolithMaterial, monolithsData.length]}
        />

        <points
          ref={starsRef}
          geometry={stars.geometry}
          material={stars.material}
        />

        <group ref={orbitGroupRef} position={[orbitBaseX, 8, 6]}>
          <mesh>
            <sphereGeometry args={[2.4, 32, 32]} />
            <meshStandardMaterial
              color={0xffb48a}
              emissive={0xff6a3d}
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
          <mesh material={ringMaterial}>
            <torusGeometry args={[5.6, 0.12, 16, 160]} />
          </mesh>
          <mesh material={ringMaterial} rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[5.6, 0.12, 16, 160]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2.8, 0]}>
            <torusGeometry args={[3.8, 0.08, 16, 140]} />
            <meshStandardMaterial
              color={0xff9565}
              emissive={0xff6a3d}
              emissiveIntensity={0.4}
              transparent
              opacity={0.7}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
          {Array.from({ length: 4 }).map((_, index) => (
            <mesh
              key={`satellite-${index}`}
              ref={(node) => {
                if (node) {
                  satellitesRef.current[index] = node;
                }
              }}
              material={orbitMaterial}
            >
              <sphereGeometry args={[0.35, 18, 18]} />
            </mesh>
          ))}
        </group>

        <group>
          {beacons.map((item, index) => (
            <mesh
              key={`beacon-${index}`}
              material={beaconMaterials[index]}
              position={[
                Math.cos(item.angle) * item.radius,
                -6 + (3.2 * item.height) / 2,
                Math.sin(item.angle) * item.radius,
              ]}
              scale={[1, item.height, 1]}
            >
              <coneGeometry args={[0.7, 3.2, 12]} />
            </mesh>
          ))}
        </group>

        <primitive object={signalLine} ref={signalPathRef} />

        <group ref={droneGroupRef}>
          {droneData.map((item, index) => (
            <mesh
              key={`drone-${index}`}
              ref={(node) => {
                if (node) {
                  dronesRef.current[index] = node;
                }
              }}
              position={[item.x, 4, item.z]}
              material={orbitMaterial}
            >
              <icosahedronGeometry args={[0.7, 0]} />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
};

export default BackgroundScene;
