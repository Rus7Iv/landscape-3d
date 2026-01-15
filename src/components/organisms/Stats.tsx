import StatItem from "../atoms/StatItem";

const Stats = () => {
  return (
    <section className="stats">
      <StatItem label="Latency" value="12ms" />
      <StatItem label="Frames" value="60fps" />
      <StatItem label="Scene" value="184k tris" />
      <StatItem label="Payload" value="~170kb gz" />
    </section>
  );
};

export default Stats;
