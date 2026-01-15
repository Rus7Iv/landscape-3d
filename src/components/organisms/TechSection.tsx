import SectionHead from "../molecules/SectionHead";

const TechSection = () => {
  return (
    <section id="tech" className="section reveal">
      <SectionHead
        eyebrow="Tech stack"
        title="Performance-first pipeline."
        lead="We keep the payload lean and the animation smooth by layering lightweight geometry with procedural motion and sparse lighting."
      />
      <div className="timeline">
        <div className="timeline-item stagger delay-1">
          <span className="timeline-step">Layer 01</span>
          <h3>Procedural terrain</h3>
          <p>
            Low-cost noise deformation with cached normals and tuned vertex
            density.
          </p>
        </div>
        <div className="timeline-item stagger delay-2">
          <span className="timeline-step">Layer 02</span>
          <h3>Instanced artifacts</h3>
          <p>
            Repeated monoliths and silhouettes for depth without extra draw
            calls.
          </p>
        </div>
        <div className="timeline-item stagger delay-3">
          <span className="timeline-step">Layer 03</span>
          <h3>Atmospheric polish</h3>
          <p>
            Fog gradients, toned lighting, and soft particle fields for
            cinematic scale.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TechSection;
