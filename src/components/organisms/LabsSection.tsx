import SectionHead from "../molecules/SectionHead";
import InlineSceneCard from "../molecules/InlineSceneCard";
import type { ScrollState } from "../../types/scroll";
import type { MutableRefObject } from "react";

type LabsSectionProps = {
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
};

const LabsSection = ({ reducedMotion, scrollRef }: LabsSectionProps) => {
  return (
    <section id="labs" className="section reveal">
      <SectionHead
        eyebrow="Lab modules"
        title="3D artifacts inside the content."
        lead="Each card below renders a mini Three.js scene to keep the story dimensional, not just the backdrop."
      />
      <div className="inline-3d-grid">
        <InlineSceneCard
          title="Orbital relay"
          description="Rotating carriers and satellites to visualize routing flow."
          variant="orbit"
          reducedMotion={reducedMotion}
          scrollRef={scrollRef}
          delayClass="delay-1"
        />
        <InlineSceneCard
          title="Prism vault"
          description="Layered geometry with emissive edges and scan-lit cores."
          variant="prism"
          reducedMotion={reducedMotion}
          scrollRef={scrollRef}
          delayClass="delay-2"
        />
        <InlineSceneCard
          title="Flux bloom"
          description="Continuous loops that react to scroll velocity and light."
          variant="flow"
          reducedMotion={reducedMotion}
          scrollRef={scrollRef}
          delayClass="delay-3"
        />
      </div>
    </section>
  );
};

export default LabsSection;
