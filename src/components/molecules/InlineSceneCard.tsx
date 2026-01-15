import InlineScene from "./InlineScene";
import type { ScrollState } from "../../types/scroll";
import type { MutableRefObject } from "react";

type InlineSceneCardProps = {
  title: string;
  description: string;
  variant: "orbit" | "prism" | "flow";
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
  delayClass: string;
};

const InlineSceneCard = ({
  title,
  description,
  variant,
  reducedMotion,
  scrollRef,
  isMobile,
  delayClass,
}: InlineSceneCardProps) => {
  return (
    <article className={`inline-3d-card stagger ${delayClass}`}>
      <InlineScene
        variant={variant}
        reducedMotion={reducedMotion}
        scrollRef={scrollRef}
        isMobile={isMobile}
      />
      <div className="inline-3d-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
};

export default InlineSceneCard;
