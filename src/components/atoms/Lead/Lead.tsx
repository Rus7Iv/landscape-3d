import type { ReactNode } from "react";
import "./Lead.css";

type LeadProps = {
  children: ReactNode;
  size?: "default" | "large";
  as?: "p" | "span";
  className?: string;
};

const Lead = ({ children, size = "default", as: Tag = "p", className }: LeadProps) => {
  const sizeClass = size === "large" ? "lead--large" : "";
  const resolvedClass = className
    ? `lead ${sizeClass} ${className}`.trim()
    : `lead ${sizeClass}`.trim();

  return <Tag className={resolvedClass}>{children}</Tag>;
};

export default Lead;
