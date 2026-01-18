import SectionHead from "../../molecules/SectionHead";
import "../Section";
import "./TechSection.css";

const TechSection = () => {
  const timeline = [
    {
      step: "Layer 01",
      title: "Procedural terrain",
      copy: "Low-cost noise deformation with cached normals and tuned vertex density.",
      delay: 1,
    },
    {
      step: "Layer 02",
      title: "Instanced artifacts",
      copy: "Repeated monoliths and silhouettes for depth without extra draw calls.",
      delay: 2,
    },
    {
      step: "Layer 03",
      title: "Atmospheric polish",
      copy: "Fog gradients, toned lighting, and soft particle fields for cinematic scale.",
      delay: 3,
    },
  ];

  return (
    <section id="tech" className="section tech-section reveal">
      <SectionHead
        eyebrow="Tech stack"
        title="Performance-first pipeline."
        lead="We keep the payload lean and the animation smooth by layering lightweight geometry with procedural motion and sparse lighting."
      />
      <div className="tech-section__timeline">
        {timeline.map((item) => (
          <div
            key={item.step}
            className={`tech-section__item reveal__stagger reveal__stagger--delay-${item.delay}`}
          >
            <span className="tech-section__step">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechSection;
