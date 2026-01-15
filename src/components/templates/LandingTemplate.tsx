import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { ScrollState } from "../../types/scroll";
import BackgroundScene from "../organisms/BackgroundScene";
import Topbar from "../organisms/Topbar";
import Hero from "../organisms/Hero";
import Stats from "../organisms/Stats";
import StudioSection from "../organisms/StudioSection";
import WorkSection from "../organisms/WorkSection";
import TechSection from "../organisms/TechSection";
import LabsSection from "../organisms/LabsSection";
import QuoteSection from "../organisms/QuoteSection";
import ContactSection from "../organisms/ContactSection";
import Footer from "../organisms/Footer";

type LandingTemplateProps = {
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
};

const LandingTemplate = ({ reducedMotion, scrollRef, isMobile }: LandingTemplateProps) => {
  const dpr = isMobile ? [1, 1.5] : [1, 2];

  return (
    <>
      <div id="scene" aria-hidden="true">
        <Canvas
          dpr={dpr}
          camera={{ fov: 48, near: 0.1, far: 240, position: [0, 18, 52] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x0b0f14, 0);
          }}
        >
          <BackgroundScene
            reducedMotion={reducedMotion}
            scrollRef={scrollRef}
            isMobile={isMobile}
          />
        </Canvas>
      </div>

      <div id="app">
        <Topbar />
        <Hero />
        <Stats />
        <StudioSection />
        <WorkSection />
        <TechSection />
        <LabsSection
          reducedMotion={reducedMotion}
          scrollRef={scrollRef}
          isMobile={isMobile}
        />
        <QuoteSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
};

export default LandingTemplate;
