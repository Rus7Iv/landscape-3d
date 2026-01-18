import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { ScrollState } from "../../../types/scroll";
import BackgroundScene from "../../organisms/BackgroundScene";
import Topbar from "../../organisms/Topbar";
import Hero from "../../organisms/Hero";
import Stats from "../../organisms/Stats";
import StudioSection from "../../organisms/StudioSection";
import WorkSection from "../../organisms/WorkSection";
import TechSection from "../../organisms/TechSection";
import LabsSection from "../../organisms/LabsSection";
import QuoteSection from "../../organisms/QuoteSection";
import ContactSection from "../../organisms/ContactSection";
import Footer from "../../organisms/Footer";
import NotificationToast from "../../molecules/NotificationToast";
import "./LandingTemplate.css";

type LandingTemplateProps = {
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
};

const LandingTemplate = ({ reducedMotion, scrollRef, isMobile }: LandingTemplateProps) => {
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComingSoon = useCallback(() => {
    setComingSoonOpen(true);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setComingSoonOpen(false);
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="landing-template">
      <div className="landing-template__scene" aria-hidden="true">
        <Canvas
          dpr={dpr}
          camera={{ fov: 48, near: 0.1, far: 240, position: [0, 18, 52] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
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

      <div className="landing-template__content">
        <Topbar />
        <Hero onComingSoon={handleComingSoon} />
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
        <ContactSection onComingSoon={handleComingSoon} />
        <Footer />
      </div>
      <NotificationToast
        isOpen={comingSoonOpen}
        tag="Coming soon"
        message="We are polishing the experience."
      />
    </div>
  );
};

export default LandingTemplate;
