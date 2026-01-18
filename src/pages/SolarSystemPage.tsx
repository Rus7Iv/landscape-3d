import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useReducedMotion from "../hooks/useReducedMotion";
import useIsMobile from "../hooks/useIsMobile";
import SolarSystemScene from "../components/organisms/SolarSystemScene";

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
    <main className="solar-system-page">
      <header className="solar-system-header">
        <Link className="ghost-button" to="/">
          Back to home
        </Link>
        <span className="tag">Prototype</span>
      </header>
      <section className="solar-system-shell">
        <h1>Solar System</h1>
        <p className="lead">
          Large-scale three.js model with physically inspired lighting, orbital
          motion, and texture-driven materials.
        </p>
        <div ref={stageRef} className="solar-system-stage">
          <SolarSystemScene reducedMotion={reducedMotion} isMobile={isMobile} />
          <div className="solar-system-overlay-wrap">
            <button
              className="solar-system-overlay-toggle"
              type="button"
              aria-expanded={overlayOpen}
              onClick={() => {
                setOverlayOpen((prev) => !prev);
              }}
            >
              Controls
            </button>
            <div className={`solar-system-overlay ${overlayOpen ? "is-open" : "is-closed"}`}>
              <p className="tag">Controls</p>
              <p className="section-lead">
                Drag to orbit, scroll to zoom, click a planet or the sun to focus.
              </p>
              <p className="section-lead">
                Distances and radii are compressed to keep all bodies readable
                while preserving orbital order.
              </p>
            </div>
          </div>
        </div>
        <div className="solar-system-actions">
          <Link className="primary-button" to="/">
            Return to the landing
          </Link>
          <Link className="ghost-button" to="/#labs">
            See lab modules
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SolarSystemPage;
