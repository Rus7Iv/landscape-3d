import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ScrollState } from "../../types/scroll";

type Variant = "orbit" | "prism" | "flow";

type InlineSceneProps = {
  variant: Variant;
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
};

type InlineSceneContentProps = InlineSceneProps;

const InlineSceneContent = ({
  variant,
  reducedMotion,
  scrollRef,
}: InlineSceneContentProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const satellitesRef = useRef<THREE.Mesh[]>([]);
  const spineRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const prismMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x1d3a46,
        emissive: 0x25d4cc,
        emissiveIntensity: 0.45,
        roughness: 0.28,
        metalness: 0.6,
      }),
    []
  );

  const prismEdgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x9ad7ff,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  const spineMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffb48a,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7,
      }),
    []
  );

  const knotMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x25d4cc,
        emissive: 0x25d4cc,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.45,
      }),
    []
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xff9565,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      }),
    []
  );

  const orbitMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x9ad7ff,
        emissive: 0x9ad7ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.75,
        roughness: 0.25,
        metalness: 0.35,
      }),
    []
  );

  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffb48a,
        emissive: 0xff6a3d,
        emissiveIntensity: 0.55,
        roughness: 0.22,
        metalness: 0.4,
      }),
    []
  );

  const prismGeometry = useMemo(() => new THREE.BoxGeometry(2.2, 2.6, 2.2), []);
  const prismEdges = useMemo(
    () => new THREE.EdgesGeometry(prismGeometry),
    [prismGeometry]
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const t = reducedMotion ? 0 : state.clock.getElapsedTime();
    const scrollT = scrollRef.current.current;

    if (variant === "prism") {
      group.rotation.y = t * 0.5 + scrollT * 1.2;
      group.rotation.x = t * 0.3 + scrollT * 0.4;
      if (spineRef.current) {
        spineRef.current.rotation.y = t * 0.8;
      }
      return;
    }

    if (variant === "flow") {
      group.rotation.x = t * 0.4 + scrollT * 0.8;
      group.rotation.y = t * 0.6 + scrollT * 1.1;
      if (haloRef.current) {
        haloRef.current.rotation.z = t * 0.5;
      }
      return;
    }

    group.rotation.y = t * 0.6 + scrollT * 1.3;
    group.rotation.x = t * 0.2 - scrollT * 0.3;
    satellitesRef.current.forEach((satellite, index) => {
      const angle = t * 0.8 + index * (Math.PI / 2);
      satellite.position.x = Math.cos(angle) * 2.8;
      satellite.position.z = Math.sin(angle) * 2.8;
      satellite.position.y = Math.sin(t * 0.6 + index) * 0.8;
    });
  });

  return (
    <>
      <ambientLight intensity={0.7} color={0xbad7ff} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} color={0xffb48a} />

      <group ref={groupRef}>
        {variant === "prism" && (
          <>
            <mesh geometry={prismGeometry} material={prismMaterial} />
            <lineSegments geometry={prismEdges} material={prismEdgeMaterial} />
            <mesh ref={spineRef} material={spineMaterial} position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.25, 0.45, 3.2, 16]} />
            </mesh>
          </>
        )}

        {variant === "flow" && (
          <>
            <mesh material={knotMaterial}>
              <torusKnotGeometry args={[1.4, 0.35, 120, 16]} />
            </mesh>
            <mesh
              ref={haloRef}
              material={haloMaterial}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[2.4, 2.6, 48]} />
            </mesh>
          </>
        )}

        {variant === "orbit" && (
          <>
            <mesh material={coreMaterial}>
              <sphereGeometry args={[1.5, 24, 24]} />
            </mesh>
            <mesh material={orbitMaterial} rotation={[Math.PI / 2.2, 0, 0]}>
              <torusGeometry args={[2.6, 0.08, 16, 80]} />
            </mesh>
            <mesh material={orbitMaterial} rotation={[0, Math.PI / 2.4, 0]}>
              <torusGeometry args={[2.6, 0.08, 16, 80]} />
            </mesh>
            {Array.from({ length: 4 }).map((_, index) => (
              <mesh
                key={`inline-satellite-${index}`}
                ref={(node) => {
                  if (node) {
                    satellitesRef.current[index] = node;
                  }
                }}
                material={orbitMaterial}
              >
                <sphereGeometry args={[0.25, 16, 16]} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </>
  );
};

const InlineScene = ({ variant, reducedMotion, scrollRef }: InlineSceneProps) => {
  return (
    <div className="inline-3d" aria-hidden="true">
      <Canvas
        className="inline-canvas"
        dpr={[1, 2]}
        camera={{ fov: 32, near: 0.1, far: 40, position: [0, 0, 9] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <InlineSceneContent
          variant={variant}
          reducedMotion={reducedMotion}
          scrollRef={scrollRef}
        />
      </Canvas>
    </div>
  );
};

export default InlineScene;
