import Eyebrow from "../../atoms/Eyebrow";
import Lead from "../../atoms/Lead";
import StatItem from "../../atoms/StatItem";
import "../Section";
import "./WorkSection.css";

const WorkSection = () => {
  const metrics = [
    { label: "Avg. session", value: "2m 14s" },
    { label: "Scroll depth", value: "86%" },
  ];

  const panels = ["Fjord Broadcast", "Terminal Atlas", "Neon Basin"];

  return (
    <section id="work" className="section section--split work-section reveal">
      <div className="work-section__content">
        <Eyebrow>Selected work</Eyebrow>
        <h2>Scenes that feel tangible, yet impossible.</h2>
        <Lead>
          From branded launches to speculative architecture, we prototype
          spatial stories that react to motion and feel alive.
        </Lead>
        <div className="work-section__metrics">
          {metrics.map((metric) => (
            <StatItem
              key={metric.label}
              label={metric.label}
              value={metric.value}
              variant="compact"
            />
          ))}
        </div>
      </div>
      <div className="work-section__media">
        {panels.map((panel, index) => (
          <div
            key={panel}
            className={`work-section__panel reveal__stagger reveal__stagger--delay-${index + 1}`}
          >
            <div className="work-section__panel-label">{panel}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkSection;
