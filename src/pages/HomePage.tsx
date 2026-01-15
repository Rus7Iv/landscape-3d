import { useEffect, useRef } from "react";
import LandingTemplate from "../components/templates/LandingTemplate";
import useReducedMotion from "../hooks/useReducedMotion";
import useIsMobile from "../hooks/useIsMobile";
import type { ScrollState } from "../types/scroll";

const HomePage = () => {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const scrollRef = useRef<ScrollState>({ current: 0, target: 0 });

  useEffect(() => {
    const updateScrollTarget = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - doc.clientHeight);
      scrollRef.current.target = doc.scrollTop / maxScroll;
    };

    updateScrollTarget();
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget);

    return () => {
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
    };
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );
    let observer: IntersectionObserver | null = null;

    const showRevealTargets = () => {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    };

    if (reducedMotion) {
      showRevealTargets();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    revealTargets.forEach((target) => observer?.observe(target));

    return () => observer?.disconnect();
  }, [reducedMotion]);

  return (
    <LandingTemplate
      reducedMotion={reducedMotion}
      scrollRef={scrollRef}
      isMobile={isMobile}
    />
  );
};

export default HomePage;
