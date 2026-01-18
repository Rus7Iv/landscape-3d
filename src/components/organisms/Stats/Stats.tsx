import StatItem from "../../atoms/StatItem";
import "./Stats.css";

const Stats = () => {
  const items = [
    { label: "Latency", value: "12ms" },
    { label: "Frames", value: "60fps" },
    { label: "Scene", value: "184k tris" },
    { label: "Payload", value: "~170kb gz" },
  ];

  return (
    <section className="stats">
      {items.map((item) => (
        <StatItem key={item.label} label={item.label} value={item.value} />
      ))}
    </section>
  );
};

export default Stats;
