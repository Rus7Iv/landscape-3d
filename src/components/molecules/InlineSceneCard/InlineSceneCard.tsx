import InlineScene from "../InlineScene";
import type { ScrollState } from "../../../types/scroll";
import type { MutableRefObject } from "react";
import "./InlineSceneCard.css";

type InlineSceneCardProps = {
  title: string;
  description: string;
  variant: "orbit" | "prism" | "flow";
  reducedMotion: boolean;
  scrollRef: MutableRefObject<ScrollState>;
  isMobile: boolean;
  delay?: 1 | 2 | 3 | 4;
};

const InlineSceneCard = ({
  title,
  description,
  variant,
  reducedMotion,
  scrollRef,
  isMobile,
  delay,
}: InlineSceneCardProps) => {
  const delayClass = delay ? `reveal__stagger--delay-${delay}` : "";
  const resolvedClass = ["inline-scene-card", "reveal__stagger", delayClass]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={resolvedClass}>
      <InlineScene
        variant={variant}
        reducedMotion={reducedMotion}
        scrollRef={scrollRef}
        isMobile={isMobile}
      />
      <div className="inline-scene-card__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
};

export default InlineSceneCard;
