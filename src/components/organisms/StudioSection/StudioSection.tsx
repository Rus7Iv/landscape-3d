import SectionHead from "../../molecules/SectionHead";
import Tag from "../../atoms/Tag";
import "../Section";
import "./StudioSection.css";

const StudioSection = () => {
  const cards = [
    {
      title: "Spatial direction",
      copy:
        "Moodboards, lighting rigs, and material libraries that keep a consistent cinematic language.",
      tag: "Creative",
      delay: 1,
    },
    {
      title: "Realtime systems",
      copy:
        "Low-poly terrain, instanced meshes, and shader tricks designed to keep the GPU under control.",
      tag: "Performance",
      delay: 2,
    },
    {
      title: "Story choreography",
      copy:
        "Scroll-driven pacing, micro-interactions, and layered copy that reveal the narrative gradually.",
      tag: "Experience",
      delay: 3,
    },
  ];

  return (
    <section id="studio" className="section studio-section reveal">
      <SectionHead
        eyebrow="Studio"
        title="Hybrid craft for realtime worlds."
        lead="We build immersive landscapes with the discipline of a product team and the taste of a film studio. Every scene is optimized, layered, and tuned for the long scroll."
      />
      <div className="studio-section__grid">
        {cards.map((card) => (
          <article
            key={card.title}
            className={`studio-section__card reveal__stagger reveal__stagger--delay-${card.delay}`}
          >
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
            <Tag>{card.tag}</Tag>
          </article>
        ))}
      </div>
    </section>
  );
};

export default StudioSection;
