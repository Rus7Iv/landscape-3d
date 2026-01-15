import SectionHead from "../molecules/SectionHead";
import Tag from "../atoms/Tag";

const StudioSection = () => {
  return (
    <section id="studio" className="section reveal">
      <SectionHead
        eyebrow="Studio"
        title="Hybrid craft for realtime worlds."
        lead="We build immersive landscapes with the discipline of a product team and the taste of a film studio. Every scene is optimized, layered, and tuned for the long scroll."
      />
      <div className="section-grid">
        <article className="glass-card stagger delay-1">
          <h3>Spatial direction</h3>
          <p>
            Moodboards, lighting rigs, and material libraries that keep a
            consistent cinematic language.
          </p>
          <Tag>Creative</Tag>
        </article>
        <article className="glass-card stagger delay-2">
          <h3>Realtime systems</h3>
          <p>
            Low-poly terrain, instanced meshes, and shader tricks designed to
            keep the GPU under control.
          </p>
          <Tag>Performance</Tag>
        </article>
        <article className="glass-card stagger delay-3">
          <h3>Story choreography</h3>
          <p>
            Scroll-driven pacing, micro-interactions, and layered copy that
            reveal the narrative gradually.
          </p>
          <Tag>Experience</Tag>
        </article>
      </div>
    </section>
  );
};

export default StudioSection;
