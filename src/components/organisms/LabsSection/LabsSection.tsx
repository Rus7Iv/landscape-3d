import SectionHead from "../../molecules/SectionHead";
import InlineSceneCard from "../../molecules/InlineSceneCard";
import type { ScrollState } from "../../../types/scroll";
import type { MutableRefObject } from "react";
import { Link } from "react-router-dom";
import Tag from "../../atoms/Tag";
import Lead from "../../atoms/Lead";
import "../../atoms/Button/Button.css";
import "../Section";
import "./LabsSection.css";

type LabsSectionProps = {
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
};

const LabsSection = ({ reducedMotion, scrollRef, isMobile }: LabsSectionProps) => {
  const cards = [
    {
      title: "Orbital relay",
      description: "Rotating carriers and satellites to visualize routing flow.",
      variant: "orbit" as const,
      delay: 1 as const,
    },
    {
      title: "Prism vault",
      description: "Layered geometry with emissive edges and scan-lit cores.",
      variant: "prism" as const,
      delay: 2 as const,
    },
    {
      title: "Flux bloom",
      description: "Continuous loops that react to scroll velocity and light.",
      variant: "flow" as const,
      delay: 3 as const,
    },
  ];

  return (
    <section id="labs" className="section labs-section reveal">
      <SectionHead
        eyebrow="Lab modules"
        title="3D artifacts inside the content."
        lead="Each card below renders a mini Three.js scene to keep the story dimensional, not just the backdrop."
      />
      <div className="labs-section__grid">
        {cards.map((card) => (
          <InlineSceneCard
            key={card.title}
            title={card.title}
            description={card.description}
            variant={card.variant}
            reducedMotion={reducedMotion}
            scrollRef={scrollRef}
            isMobile={isMobile}
            delay={card.delay}
          />
        ))}
      </div>
      <div className="labs-section__link-card reveal__stagger reveal__stagger--delay-4">
        <div>
          <Tag as="p">New module</Tag>
          <h3>Solar system page</h3>
          <Lead>
            Dedicated route for the full-scale solar system scene and controls.
          </Lead>
        </div>
        <Link className="button button--primary" to="/solar-system">
          Open module
        </Link>
      </div>
    </section>
  );
};

export default LabsSection;
