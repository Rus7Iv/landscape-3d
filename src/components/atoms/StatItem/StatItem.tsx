import "./StatItem.css";

type StatItemProps = {
  label: string;
  value: string;
  variant?: "default" | "compact";
  className?: string;
};

const StatItem = ({ label, value, variant = "default", className }: StatItemProps) => {
  const variantClass = variant === "compact" ? "stat-item--compact" : "";
  const resolvedClass = className
    ? `stat-item ${variantClass} ${className}`.trim()
    : `stat-item ${variantClass}`.trim();

  return (
    <div className={resolvedClass}>
      <span className="stat-item__label">{label}</span>
      <span className="stat-item__value">{value}</span>
    </div>
  );
};

export default StatItem;
