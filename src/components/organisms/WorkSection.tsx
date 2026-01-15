import Eyebrow from "../atoms/Eyebrow";

const WorkSection = () => {
  return (
    <section id="work" className="section reveal split">
      <div className="split-text">
        <Eyebrow>Selected work</Eyebrow>
        <h2>Scenes that feel tangible, yet impossible.</h2>
        <p className="section-lead">
          From branded launches to speculative architecture, we prototype
          spatial stories that react to motion and feel alive.
        </p>
        <div className="split-metrics">
          <div>
            <span className="stat-label">Avg. session</span>
            <span className="stat-value">2m 14s</span>
          </div>
          <div>
            <span className="stat-label">Scroll depth</span>
            <span className="stat-value">86%</span>
          </div>
        </div>
      </div>
      <div className="split-media">
        <div className="media-panel stagger delay-1">
          <div className="media-label">Fjord Broadcast</div>
        </div>
        <div className="media-panel stagger delay-2">
          <div className="media-label">Terminal Atlas</div>
        </div>
        <div className="media-panel stagger delay-3">
          <div className="media-label">Neon Basin</div>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
