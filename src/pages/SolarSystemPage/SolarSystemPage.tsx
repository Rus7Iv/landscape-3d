import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useReducedMotion from "../../hooks/useReducedMotion";
import useIsMobile from "../../hooks/useIsMobile";
import SolarSystemScene from "../../components/organisms/SolarSystemScene";
import Lead from "../../components/atoms/Lead";
import Tag from "../../components/atoms/Tag";
import "../../components/atoms/Button/Button.css";
import "./SolarSystemPage.css";

const SolarSystemPage = () => {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(true);
  const [overlayAutoHidden, setOverlayAutoHidden] = useState(false);

  useEffect(() => {
    if (overlayAutoHidden) {
      return;
    }
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const handleAutoHide = () => {
      setOverlayOpen(false);
      setOverlayAutoHidden(true);
    };
    stage.addEventListener("wheel", handleAutoHide, { once: true, passive: true });
    stage.addEventListener("pointerdown", handleAutoHide, { once: true });
    return () => {
      stage.removeEventListener("wheel", handleAutoHide);
      stage.removeEventListener("pointerdown", handleAutoHide);
    };
  }, [overlayAutoHidden]);

  return (
    <main className="solar-system">
      <header className="solar-system__header">
        <Link className="button button--ghost" to="/">
          Back to home
        </Link>
        <Tag>Prototype</Tag>
      </header>
      <section className="solar-system__shell">
        <h1>Solar System</h1>
        <Lead size="large">
          Large-scale three.js model with physically inspired lighting, orbital
          motion, and texture-driven materials.
        </Lead>
        <div ref={stageRef} className="solar-system__stage">
          <SolarSystemScene reducedMotion={reducedMotion} isMobile={isMobile} />
          <div className="solar-system__overlay-wrap">
            <button
              className="solar-system__overlay-toggle"
              type="button"
              aria-expanded={overlayOpen}
              onClick={() => {
                setOverlayOpen((prev) => !prev);
              }}
            >
              Controls
            </button>
            <div
              className={`solar-system__overlay ${
                overlayOpen ? "solar-system__overlay--open" : "solar-system__overlay--closed"
              }`}
            >
              <Tag as="p">Controls</Tag>
              <Lead>
                Drag to orbit, scroll to zoom, click a planet or the sun to
                focus.
              </Lead>
              <Lead>
                Distances and radii are compressed to keep all bodies readable
                while preserving orbital order.
              </Lead>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SolarSystemPage;
