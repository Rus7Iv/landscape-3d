import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import type { Group, Mesh, Object3D, Texture } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Line,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointsMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type SolarSystemSceneProps = {
  reducedMotion: boolean;
  isMobile: boolean;
};

const ORBIT_SPEED = 0.15;
const ROTATION_SPEED = 1.05;
const DISTANCE_POWER = 0.6;
const DISTANCE_SCALE = 35;
const RADIUS_POWER = 0.65;
const RADIUS_SCALE = 0.8;
const SUN_RADIUS = 6.5;

const getDistance = (au: number) =>
  Math.pow(au, DISTANCE_POWER) * DISTANCE_SCALE;
const getRadius = (earthRadii: number) =>
  Math.pow(earthRadii, RADIUS_POWER) * RADIUS_SCALE;

const clampChannel = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex: number) => ({
  r: (hex >> 16) & 255,
  g: (hex >> 8) & 255,
  b: hex & 255,
});

const createSeededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const createCanvasTexture = (
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  wrap = true
) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
  draw(ctx, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  if (wrap) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  }
  texture.needsUpdate = true;
  return texture;
};

const createNoiseTexture = (
  size: number,
  baseColor: number,
  noiseScale: number,
  noiseStrength: number,
  seed: number
) => {
  const base = hexToRgb(baseColor);
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    ctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;
    ctx.fillRect(0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n = noise.noise(x * noiseScale, y * noiseScale, seed);
        const value = n * noiseStrength;
        imageData.data[idx] = clampChannel(imageData.data[idx] + value);
        imageData.data[idx + 1] = clampChannel(imageData.data[idx + 1] + value);
        imageData.data[idx + 2] = clampChannel(imageData.data[idx + 2] + value);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createCraterTexture = (
  size: number,
  baseColor: number,
  craterColor: number,
  noiseScale: number,
  noiseStrength: number,
  seed: number,
  craterCount: number
) => {
  const base = hexToRgb(baseColor);
  const crater = hexToRgb(craterColor);
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    ctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;
    ctx.fillRect(0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n = noise.noise(x * noiseScale, y * noiseScale, seed);
        const value = n * noiseStrength;
        imageData.data[idx] = clampChannel(base.r + value);
        imageData.data[idx + 1] = clampChannel(base.g + value);
        imageData.data[idx + 2] = clampChannel(base.b + value);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const rand = createSeededRandom(seed * 1000 + 17);
    for (let i = 0; i < craterCount; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const radius = (rand() * 0.7 + 0.3) * (size * 0.025);
      const gradient = ctx.createRadialGradient(
        x,
        y,
        radius * 0.2,
        x,
        y,
        radius
      );
      gradient.addColorStop(
        0,
        `rgba(${crater.r}, ${crater.g}, ${crater.b}, 0.55)`
      );
      gradient.addColorStop(
        0.6,
        `rgba(${crater.r}, ${crater.g}, ${crater.b}, 0.25)`
      );
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = Math.max(1, radius * 0.1);
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};

const createBandTexture = (
  size: number,
  colors: number[],
  noiseScale: number,
  noiseStrength: number,
  seed: number
) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const t = y / size;
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const shift =
          noise.noise(x * noiseScale * 0.6, y * noiseScale, seed) * 0.08;
        const bandIndex = Math.floor(
          ((t + shift + 1) % 1) * colors.length
        );
        const base = hexToRgb(colors[bandIndex]);
        const grain = noise.noise(
          x * noiseScale * 1.5,
          y * noiseScale * 1.5,
          seed + 12
        );
        const variation = grain * noiseStrength;
        imageData.data[idx] = clampChannel(base.r + variation);
        imageData.data[idx + 1] = clampChannel(base.g + variation);
        imageData.data[idx + 2] = clampChannel(base.b + variation);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createSunTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const gradient = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.12,
      size * 0.5,
      size * 0.5,
      size * 0.5
    );
    gradient.addColorStop(0, "#fff0c9");
    gradient.addColorStop(0.45, "#ffbe76");
    gradient.addColorStop(0.75, "#ff8f4d");
    gradient.addColorStop(1, "#f06a2a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n = noise.noise(x * 0.06, y * 0.06, 0.5);
        const value = n * 32;
        imageData.data[idx] = clampChannel(imageData.data[idx] + value);
        imageData.data[idx + 1] = clampChannel(imageData.data[idx + 1] + value);
        imageData.data[idx + 2] = clampChannel(imageData.data[idx + 2] + value);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createSunCoronaTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(
    size,
    (ctx) => {
      const imageData = ctx.createImageData(size, size);
      const center = size * 0.5;
      const maxRadius = center;
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - center;
          const dy = y - center;
          const r = Math.sqrt(dx * dx + dy * dy) / maxRadius;
          const idx = (y * size + x) * 4;
          if (r > 1) {
            imageData.data[idx + 3] = 0;
            continue;
          }
          const base = Math.max(0, 1 - r);
          const flicker =
            noise.noise(x * 0.05, y * 0.05, 1.4) * 0.12 +
            noise.noise(x * 0.15, y * 0.15, 3.1) * 0.06;
          const alpha = clampChannel((base + flicker) * 220);
          imageData.data[idx] = clampChannel(255 - r * 40);
          imageData.data[idx + 1] = clampChannel(188 - r * 60);
          imageData.data[idx + 2] = clampChannel(112 - r * 50);
          imageData.data[idx + 3] = alpha;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    },
    false
  );
};

const createSpaceBackdropTexture = (size: number) => {
  const noise = new ImprovedNoise();
  const rand = createSeededRandom(42);
  return createCanvasTexture(size, (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, "#05070c");
    gradient.addColorStop(0.5, "#0a1020");
    gradient.addColorStop(1, "#02050b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 4; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const radius = size * (0.18 + rand() * 0.22);
      const hue = i % 2 === 0 ? "80,120,190" : "150,90,200";
      const nebula = ctx.createRadialGradient(x, y, 0, x, y, radius);
      nebula.addColorStop(0, `rgba(${hue}, 0.2)`);
      nebula.addColorStop(0.6, `rgba(${hue}, 0.08)`);
      nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, size, size);
    }

    const imageData = ctx.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n = noise.noise(x * 0.02, y * 0.02, 0.7) * 16;
        imageData.data[idx] = clampChannel(imageData.data[idx] + n);
        imageData.data[idx + 1] = clampChannel(imageData.data[idx + 1] + n);
        imageData.data[idx + 2] = clampChannel(imageData.data[idx + 2] + n);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createEarthTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const lat = (y / size) * Math.PI - Math.PI / 2;
      const polar = Math.abs(Math.sin(lat));
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n1 = noise.noise(x * 0.02, y * 0.02, 0.6);
        const n2 = noise.noise(x * 0.06, y * 0.06, 1.9);
        const elevation = n1 * 0.7 + n2 * 0.3;
        const humidity = noise.noise(x * 0.04, y * 0.04, 3.4);
        let base = { r: 14, g: 40, b: 94 };
        if (polar > 0.78) {
          base = { r: 230, g: 235, b: 245 };
        } else if (elevation < -0.08) {
          base = { r: 8, g: 36, b: 92 };
        } else if (elevation < -0.02) {
          base = { r: 18, g: 64, b: 120 };
        } else if (elevation > 0.35) {
          base = { r: 120, g: 118, b: 112 };
        } else if (humidity < -0.18) {
          base = { r: 176, g: 146, b: 102 };
        } else if (humidity > 0.15) {
          base = { r: 34, g: 102, b: 72 };
        } else {
          base = { r: 42, g: 120, b: 86 };
        }
        const grain = noise.noise(x * 0.2, y * 0.2, 7.1) * 14;
        imageData.data[idx] = clampChannel(base.r + grain);
        imageData.data[idx + 1] = clampChannel(base.g + grain);
        imageData.data[idx + 2] = clampChannel(base.b + grain);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createEarthCloudsTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const lat = (y / size) * Math.PI - Math.PI / 2;
      const latitudeFade = Math.pow(Math.cos(lat), 0.6);
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n1 = noise.noise(x * 0.03, y * 0.03, 1.8);
        const n2 = noise.noise(x * 0.1, y * 0.1, 5.2);
        const coverage = n1 * 0.65 + n2 * 0.35;
        if (coverage > 0.12) {
          const alpha = Math.min(
            255,
            (coverage - 0.12) * 240 * latitudeFade
          );
          imageData.data[idx] = 245;
          imageData.data[idx + 1] = 248;
          imageData.data[idx + 2] = 255;
          imageData.data[idx + 3] = clampChannel(alpha);
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createVenusTexture = (size: number) => {
  const colors = [0xf3e2c1, 0xe7cf9f, 0xf7e8c8, 0xdfc189, 0xf0d2a4];
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const t = y / size;
      const equator = 1 - Math.abs(t - 0.5) * 2;
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const warp = noise.noise(x * 0.015, y * 0.015, 0.9) * 0.08;
        const bandIndex = Math.floor(
          ((t + warp + 1) % 1) * colors.length
        );
        const base = hexToRgb(colors[bandIndex]);
        const swirl = noise.noise(x * 0.08, y * 0.08, 2.2) * 18;
        const haze = noise.noise(x * 0.02, y * 0.02, 6.3) * 10;
        const lift = equator * 8;
        imageData.data[idx] = clampChannel(base.r + swirl + haze + lift);
        imageData.data[idx + 1] = clampChannel(base.g + swirl + haze + lift);
        imageData.data[idx + 2] = clampChannel(base.b + swirl + haze + lift);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createMarsTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const lat = (y / size) * Math.PI - Math.PI / 2;
      const polar = Math.abs(Math.sin(lat));
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const n1 = noise.noise(x * 0.05, y * 0.05, 1.1);
        const n2 = noise.noise(x * 0.12, y * 0.12, 2.9);
        const relief = n1 * 0.6 + n2 * 0.4;
        let base = { r: 164, g: 84, b: 54 };
        if (polar > 0.82) {
          base = { r: 232, g: 230, b: 235 };
        } else if (relief > 0.22) {
          base = { r: 182, g: 96, b: 60 };
        } else if (relief < -0.18) {
          base = { r: 118, g: 62, b: 46 };
        }
        const dust = noise.noise(x * 0.2, y * 0.2, 7.1) * 12;
        imageData.data[idx] = clampChannel(base.r + dust);
        imageData.data[idx + 1] = clampChannel(base.g + dust);
        imageData.data[idx + 2] = clampChannel(base.b + dust);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createJupiterTexture = (size: number) => {
  const colors = [
    0xe6d1b0,
    0xd2b08c,
    0xf3ddbf,
    0xc38b6c,
    0xe8c7a4,
    0xb57a5d,
  ];
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const t = y / size;
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const warp = noise.noise(x * 0.03, y * 0.03, 2.2) * 0.12;
        const bandIndex = Math.floor(
          ((t + warp + 1) % 1) * colors.length
        );
        const base = hexToRgb(colors[bandIndex]);
        const streak = noise.noise(x * 0.16, y * 0.08, 3.2) * 12;
        imageData.data[idx] = clampChannel(base.r + streak);
        imageData.data[idx + 1] = clampChannel(base.g + streak);
        imageData.data[idx + 2] = clampChannel(base.b + streak);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const spotX = size * 0.66;
    const spotY = size * 0.58;
    const spotW = size * 0.2;
    const spotH = size * 0.12;
    ctx.save();
    ctx.translate(spotX, spotY);
    ctx.scale(spotW, spotH);
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.5, 0.35, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(202, 108, 74, 0.85)";
    ctx.fill();
    ctx.restore();
  });
};

const createSaturnTexture = (size: number) => {
  const colors = [0xf2e3c4, 0xe6d1ad, 0xf7ecd3, 0xd9c29b, 0xf0dbb8];
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const t = y / size;
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const warp = noise.noise(x * 0.025, y * 0.025, 4.8) * 0.1;
        const bandIndex = Math.floor(
          ((t + warp + 1) % 1) * colors.length
        );
        const base = hexToRgb(colors[bandIndex]);
        const streak = noise.noise(x * 0.14, y * 0.08, 5.6) * 10;
        imageData.data[idx] = clampChannel(base.r + streak);
        imageData.data[idx + 1] = clampChannel(base.g + streak);
        imageData.data[idx + 2] = clampChannel(base.b + streak);
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createIceGiantTexture = (
  size: number,
  baseColor: number,
  accentColor: number,
  seed: number
) => {
  const base = hexToRgb(baseColor);
  const accent = hexToRgb(accentColor);
  const noise = new ImprovedNoise();
  return createCanvasTexture(size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      const t = y / size;
      const equator = 1 - Math.abs(t - 0.5) * 2;
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size + x) * 4;
        const band = noise.noise(x * 0.04, y * 0.04, seed) * 0.4 + 0.5;
        const mix = Math.min(1, Math.max(0, band * 0.45 + equator * 0.2));
        imageData.data[idx] = clampChannel(
          base.r + (accent.r - base.r) * mix
        );
        imageData.data[idx + 1] = clampChannel(
          base.g + (accent.g - base.g) * mix
        );
        imageData.data[idx + 2] = clampChannel(
          base.b + (accent.b - base.b) * mix
        );
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });
};

const createRingTexture = (size: number) => {
  const noise = new ImprovedNoise();
  return createCanvasTexture(
    size,
    (ctx) => {
      const imageData = ctx.createImageData(size, size);
      const center = size / 2;
      const maxRadius = center;
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - center;
          const dy = y - center;
          const r = Math.sqrt(dx * dx + dy * dy) / maxRadius;
          const idx = (y * size + x) * 4;
          if (r < 0.32 || r > 0.95) {
            imageData.data[idx + 3] = 0;
            continue;
          }
          const band =
            Math.sin(r * 90 + noise.noise(x * 0.04, y * 0.04, 0.2) * 2) * 0.5 +
            0.5;
          const alpha = 80 + band * 140;
          imageData.data[idx] = 225;
          imageData.data[idx + 1] = 200;
          imageData.data[idx + 2] = 170;
          imageData.data[idx + 3] = clampChannel(alpha);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    },
    false
  );
};

const createPlanetTextures = (
  size: number
): Record<PlanetTextureKey, Texture> => ({
  sun: createSunTexture(size),
  mercury: createCraterTexture(size, 0x8a8a8a, 0x5a5a5a, 0.12, 26, 0.8, 28),
  venus: createVenusTexture(size),
  earth: createEarthTexture(size),
  earthClouds: createEarthCloudsTexture(size),
  mars: createMarsTexture(size),
  jupiter: createJupiterTexture(size),
  saturn: createSaturnTexture(size),
  saturnRing: createRingTexture(size),
  uranus: createIceGiantTexture(size, 0x79cfd6, 0xa7f0f0, 5.1),
  neptune: createIceGiantTexture(size, 0x2f5aa8, 0x4f7bd1, 6.3),
  moon: createCraterTexture(size, 0x9a9a9a, 0x6a6a6a, 0.14, 30, 7.4, 34),
});

type PlanetTextureKey =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "earthClouds"
  | "mars"
  | "jupiter"
  | "saturn"
  | "saturnRing"
  | "uranus"
  | "neptune"
  | "moon";

type PlanetRing = {
  inner: number;
  outer: number;
  texture: PlanetTextureKey;
  opacity: number;
};

type PlanetMoon = {
  radius: number;
  distance: number;
  orbitPeriod: number;
  texture: PlanetTextureKey;
};

type PlanetConfig = {
  name: string;
  radius: number;
  distance: number;
  orbitPeriod: number;
  rotationPeriod: number;
  axialTilt: number;
  texture: PlanetTextureKey;
  roughness?: number;
  metalness?: number;
  ring?: PlanetRing;
  atmosphere?: {
    color: number;
    opacity: number;
    size: number;
  };
  clouds?: {
    texture: PlanetTextureKey;
    opacity: number;
    size: number;
    speed: number;
  };
  moon?: PlanetMoon;
};

type FocusState = {
  target: Vector3;
  distance: number | null;
  active: boolean;
  follow: boolean;
  targetObject: Object3D | null;
};

const PLANETS: PlanetConfig[] = [
  {
    name: "Mercury",
    radius: 0.38,
    distance: 0.39,
    orbitPeriod: 0.24,
    rotationPeriod: 58.6,
    axialTilt: 0.03,
    texture: "mercury",
    roughness: 0.9,
    metalness: 0.05,
  },
  {
    name: "Venus",
    radius: 0.95,
    distance: 0.72,
    orbitPeriod: 0.62,
    rotationPeriod: 243,
    axialTilt: 177.4,
    texture: "venus",
    roughness: 0.8,
    metalness: 0.1,
    atmosphere: {
      color: 0xf2d7b0,
      opacity: 0.28,
      size: 1.03,
    },
  },
  {
    name: "Earth",
    radius: 1,
    distance: 1,
    orbitPeriod: 1,
    rotationPeriod: 1,
    axialTilt: 23.4,
    texture: "earth",
    roughness: 0.6,
    metalness: 0.12,
    atmosphere: {
      color: 0x6aa7ff,
      opacity: 0.25,
      size: 1.04,
    },
    clouds: {
      texture: "earthClouds",
      opacity: 0.42,
      size: 1.02,
      speed: 1.2,
    },
    moon: {
      radius: 0.27,
      distance: 4.4,
      orbitPeriod: 0.0748,
      texture: "moon",
    },
  },
  {
    name: "Mars",
    radius: 0.53,
    distance: 1.52,
    orbitPeriod: 1.88,
    rotationPeriod: 1.03,
    axialTilt: 25.2,
    texture: "mars",
    roughness: 0.85,
    metalness: 0.08,
  },
  {
    name: "Jupiter",
    radius: 11.2,
    distance: 5.2,
    orbitPeriod: 11.86,
    rotationPeriod: 0.41,
    axialTilt: 3.1,
    texture: "jupiter",
    roughness: 0.5,
    metalness: 0.02,
  },
  {
    name: "Saturn",
    radius: 9.45,
    distance: 9.58,
    orbitPeriod: 29.4,
    rotationPeriod: 0.44,
    axialTilt: 26.7,
    texture: "saturn",
    roughness: 0.55,
    metalness: 0.02,
    ring: {
      inner: 1.35,
      outer: 2.3,
      texture: "saturnRing",
      opacity: 0.75,
    },
  },
  {
    name: "Uranus",
    radius: 4.0,
    distance: 19.2,
    orbitPeriod: 84,
    rotationPeriod: 0.72,
    axialTilt: 97.8,
    texture: "uranus",
    roughness: 0.48,
    metalness: 0.05,
  },
  {
    name: "Neptune",
    radius: 3.9,
    distance: 30.05,
    orbitPeriod: 164.8,
    rotationPeriod: 0.67,
    axialTilt: 28.3,
    texture: "neptune",
    roughness: 0.5,
    metalness: 0.05,
  },
];

const OrbitPath = ({ radius }: { radius: number }) => {
  const geometry = useMemo(() => {
    const segments = 240;
    const positions = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      const index = i * 3;
      positions[index] = Math.cos(angle) * radius;
      positions[index + 1] = 0;
      positions[index + 2] = Math.sin(angle) * radius;
    }
    const orbitGeometry = new BufferGeometry();
    orbitGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    return orbitGeometry;
  }, [radius]);

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        color: 0x1d3646,
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  const line = useMemo(() => new Line(geometry, material), [geometry, material]);

  return <primitive object={line} />;
};

type PlanetProps = {
  data: PlanetConfig;
  textures: Record<PlanetTextureKey, Texture>;
  reducedMotion: boolean;
  scaledDistance: number;
  scaledRadius: number;
  onSelect: (target: Object3D | null, radius: number) => void;
};

const Planet = ({
  data,
  textures,
  reducedMotion,
  scaledDistance,
  scaledRadius,
  onSelect,
}: PlanetProps) => {
  const orbitRef = useRef<Group>(null);
  const spinRef = useRef<Mesh>(null);
  const moonOrbitRef = useRef<Group>(null);
  const cloudsRef = useRef<Mesh>(null);

  const tilt = MathUtils.degToRad(data.axialTilt);
  const moonDistance = data.moon ? scaledRadius * data.moon.distance : 0;
  const moonRadius = data.moon ? getRadius(data.moon.radius) * 0.55 : 0;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (orbitRef.current) {
      orbitRef.current.rotation.y = reducedMotion
        ? 0
        : (t * ORBIT_SPEED) / data.orbitPeriod;
    }
    if (spinRef.current) {
      spinRef.current.rotation.y = reducedMotion
        ? 0
        : (t * ROTATION_SPEED) / data.rotationPeriod;
    }
    if (cloudsRef.current && data.clouds) {
      cloudsRef.current.rotation.y = reducedMotion
        ? 0
        : (t * ROTATION_SPEED * data.clouds.speed) / data.rotationPeriod;
    }
    if (moonOrbitRef.current && data.moon) {
      moonOrbitRef.current.rotation.y = reducedMotion
        ? 0
        : (t * ORBIT_SPEED * 6) / data.moon.orbitPeriod;
    }
  });

  const planetMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures[data.texture],
        roughness: data.roughness ?? 0.7,
        metalness: data.metalness ?? 0.1,
      }),
    [data, textures]
  );

  const ringMaterial = useMemo(() => {
    if (!data.ring) {
      return null;
    }
    return new MeshStandardMaterial({
      map: textures[data.ring.texture],
      transparent: true,
      opacity: data.ring.opacity,
      side: DoubleSide,
      roughness: 0.6,
      metalness: 0.05,
      emissive: 0xbfa68d,
      emissiveIntensity: 0.1,
      depthWrite: false,
    });
  }, [data.ring, textures]);

  const cloudsMaterial = useMemo(() => {
    if (!data.clouds) {
      return null;
    }
    return new MeshStandardMaterial({
      map: textures[data.clouds.texture],
      transparent: true,
      opacity: data.clouds.opacity,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
      emissive: 0xffffff,
      emissiveIntensity: 0.15,
    });
  }, [data.clouds, textures]);

  const atmosphereMaterial = useMemo(() => {
    if (!data.atmosphere) {
      return null;
    }
    return new MeshBasicMaterial({
      color: data.atmosphere.color,
      transparent: true,
      opacity: data.atmosphere.opacity,
      blending: AdditiveBlending,
      depthWrite: false,
      side: BackSide,
    });
  }, [data.atmosphere]);

  const hitAreaMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  const hitRadius = Math.max(scaledRadius * 1.4, 1.1);

  return (
    <group ref={orbitRef}>
      <group position={[scaledDistance, 0, 0]} rotation={[0, 0, tilt]}>
        <mesh
          ref={spinRef}
          material={planetMaterial}
          onClick={(event) => {
            event.stopPropagation();
            if (!spinRef.current) {
              return;
            }
            onSelect(spinRef.current, scaledRadius);
          }}
        >
          <sphereGeometry args={[scaledRadius, 64, 64]} />
        </mesh>
        <mesh
          material={hitAreaMaterial}
          onClick={(event) => {
            event.stopPropagation();
            if (!spinRef.current) {
              return;
            }
            onSelect(spinRef.current, scaledRadius);
          }}
        >
          <sphereGeometry args={[hitRadius, 24, 24]} />
        </mesh>
        {data.atmosphere && atmosphereMaterial && (
          <mesh material={atmosphereMaterial}>
            <sphereGeometry
              args={[scaledRadius * data.atmosphere.size, 48, 48]}
            />
          </mesh>
        )}
        {data.clouds && cloudsMaterial && (
          <mesh ref={cloudsRef} material={cloudsMaterial}>
            <sphereGeometry
              args={[scaledRadius * data.clouds.size, 64, 64]}
            />
          </mesh>
        )}
        {data.ring && ringMaterial && (
          <mesh material={ringMaterial} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                scaledRadius * data.ring.inner,
                scaledRadius * data.ring.outer,
                128,
              ]}
            />
          </mesh>
        )}
        {data.moon && (
          <group ref={moonOrbitRef}>
            <mesh position={[moonDistance, 0, 0]}>
              <sphereGeometry args={[moonRadius, 32, 32]} />
              <meshStandardMaterial
                map={textures[data.moon.texture]}
                roughness={0.85}
                metalness={0.05}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};

type SolarSystemSceneContentProps = SolarSystemSceneProps & {
  onSelect: (target: Object3D | null, radius: number) => void;
};

const SolarSystemSceneContent = ({
  reducedMotion,
  isMobile,
  onSelect,
}: SolarSystemSceneContentProps) => {
  const { gl } = useThree();
  const textureSize = isMobile ? 256 : 512;
  const spaceTextureSize = isMobile ? 512 : 1024;
  const textures = useMemo(() => createPlanetTextures(textureSize), [textureSize]);
  const spaceTexture = useMemo(
    () => createSpaceBackdropTexture(spaceTextureSize),
    [spaceTextureSize]
  );
  const sunCoronaTexture = useMemo(
    () => createSunCoronaTexture(textureSize),
    [textureSize]
  );

  useEffect(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    Object.values(textures).forEach((texture) => {
      texture.anisotropy = maxAnisotropy;
    });
    spaceTexture.anisotropy = maxAnisotropy;
    sunCoronaTexture.anisotropy = maxAnisotropy;
  }, [gl, textures, spaceTexture, sunCoronaTexture]);

  const starfield = useMemo(() => {
    const count = isMobile ? 1600 : 2800;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = MathUtils.randFloat(260, 620);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      const index = i * 3;
      positions[index] = radius * sinPhi * Math.cos(theta);
      positions[index + 1] = radius * Math.cos(phi) * 0.9;
      positions[index + 2] = radius * sinPhi * Math.sin(theta);

      const tint = Math.random();
      let r = 1;
      let g = 1;
      let b = 1;
      if (tint < 0.2) {
        r = 0.72;
        g = 0.82;
        b = 1;
      } else if (tint < 0.4) {
        r = 1;
        g = 0.9;
        b = 0.78;
      } else if (tint < 0.6) {
        r = 0.8;
        g = 0.88;
        b = 1;
      }
      const intensity = MathUtils.randFloat(0.65, 1);
      colors[index] = r * intensity;
      colors[index + 1] = g * intensity;
      colors[index + 2] = b * intensity;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    const material = new PointsMaterial({
      size: isMobile ? 0.9 : 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
    });
    return { geometry, material };
  }, [isMobile]);

  const sunRef = useRef<Mesh>(null);
  const sunCoronaRef = useRef<Mesh>(null);
  const scaledPlanets = useMemo(
    () =>
      PLANETS.map((planet) => ({
        ...planet,
        scaledDistance: getDistance(planet.distance),
        scaledRadius: getRadius(planet.radius),
      })),
    []
  );

  const sunMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures.sun,
        emissive: 0xffb067,
        emissiveMap: textures.sun,
        emissiveIntensity: 1.75,
        roughness: 0.55,
        metalness: 0.05,
      }),
    [textures.sun]
  );

  const sunCoronaMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: sunCoronaTexture,
        transparent: true,
        opacity: 0.65,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      }),
    [sunCoronaTexture]
  );

  const sunGlowMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0xffb36b,
        transparent: true,
        opacity: 0.25,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const spaceMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: spaceTexture,
        side: BackSide,
      }),
    [spaceTexture]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = reducedMotion ? 0 : t * 0.05;
    }
    if (sunCoronaRef.current) {
      sunCoronaRef.current.rotation.z = reducedMotion ? 0 : t * 0.08;
    }
  });

  return (
    <>
      <fog attach="fog" args={[0x05070b, 160, 900]} />
      <mesh material={spaceMaterial}>
        <sphereGeometry args={[1200, 64, 64]} />
      </mesh>
      <ambientLight intensity={0.24} color={0xb1c6d8} />
      <directionalLight
        position={[120, 80, -40]}
        intensity={0.45}
        color={0x9dbbe8}
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={4}
        distance={900}
        decay={2}
        color={0xffd6a3}
      />
      <mesh
        ref={sunRef}
        material={sunMaterial}
        onClick={(event) => {
          event.stopPropagation();
          if (!sunRef.current) {
            return;
          }
          onSelect(sunRef.current, SUN_RADIUS);
        }}
      >
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
      </mesh>
      <mesh material={sunGlowMaterial}>
        <sphereGeometry args={[SUN_RADIUS * 1.35, 32, 32]} />
      </mesh>
      <mesh ref={sunCoronaRef} material={sunCoronaMaterial}>
        <sphereGeometry args={[SUN_RADIUS * 1.6, 48, 48]} />
      </mesh>
      <points geometry={starfield.geometry} material={starfield.material} />

      {scaledPlanets.map((planet) => (
        <OrbitPath key={`${planet.name}-orbit`} radius={planet.scaledDistance} />
      ))}
      {scaledPlanets.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          textures={textures}
          reducedMotion={reducedMotion}
          scaledDistance={planet.scaledDistance}
          scaledRadius={planet.scaledRadius}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

type SolarSystemControlsProps = SolarSystemSceneProps & {
  focusRef: MutableRefObject<FocusState>;
};

const SolarSystemControls = ({ reducedMotion, isMobile, focusRef }: SolarSystemControlsProps) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const focusOffset = useRef(new Vector3());
  const focusTarget = useRef(new Vector3());
  const focusDelta = useRef(new Vector3());

  useEffect(() => {
    const controls = controlsRef.current ?? new OrbitControls(camera, gl.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.9;
    controls.minDistance = isMobile ? 8 : 4;
    controls.maxDistance = isMobile ? 900 : 1100;
    controls.minPolarAngle = MathUtils.degToRad(10);
    controls.maxPolarAngle = MathUtils.degToRad(135);
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.4;
    controls.target.set(0, 0, 0);
    camera.position.set(0, 90, isMobile ? 380 : 420);
    controls.update();

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, reducedMotion, isMobile]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }
    const focus = focusRef.current;
    if (focus.targetObject) {
      focus.targetObject.getWorldPosition(focus.target);
    }
    if (focus.active && focus.distance) {
      focusTarget.current.copy(focus.target);
      controls.target.lerp(focusTarget.current, 0.08);
      focusOffset.current.copy(camera.position).sub(controls.target);
      if (focusOffset.current.lengthSq() < 0.0001) {
        focusOffset.current.set(0, 0.25, 1);
      }
      focusOffset.current.normalize().multiplyScalar(focus.distance);
      camera.position.lerp(focusOffset.current.add(controls.target), 0.08);
      if (Math.abs(camera.position.distanceTo(controls.target) - focus.distance) < 0.25) {
        focus.active = false;
      }
    }
    if (!focus.active && focus.follow) {
      focusDelta.current.copy(focus.target).sub(controls.target);
      if (focusDelta.current.lengthSq() > 0) {
        camera.position.add(focusDelta.current);
        controls.target.add(focusDelta.current);
      }
    }
    controls.update();
  });

  return null;
};

const SolarSystemScene = ({ reducedMotion, isMobile }: SolarSystemSceneProps) => {
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];
  const focusRef = useRef<FocusState>({
    target: new Vector3(),
    distance: null,
    active: false,
    follow: false,
    targetObject: null,
  });
  const handleSelect = useCallback((target: Object3D | null, radius: number) => {
    if (!target) {
      return;
    }
    const focus = focusRef.current;
    focus.targetObject = target;
    target.getWorldPosition(focus.target);
    focus.distance = Math.max(radius * 2.6, 4);
    focus.active = true;
    focus.follow = true;
  }, []);

  return (
    <div className="solar-system-canvas" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ fov: 60, near: 0.1, far: 1400, position: [0, 90, 420] }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.setClearColor(0x05070b, 1);
        }}
      >
        <SolarSystemSceneContent
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          onSelect={handleSelect}
        />
        <SolarSystemControls
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          focusRef={focusRef}
        />
      </Canvas>
    </div>
  );
};

export default SolarSystemScene;
