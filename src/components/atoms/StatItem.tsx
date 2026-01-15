type StatItemProps = {
  label: string;
  value: string;
};

const StatItem = ({ label, value }: StatItemProps) => {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
};

export default StatItem;
