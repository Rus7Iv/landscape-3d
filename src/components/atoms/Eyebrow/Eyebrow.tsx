import type { ReactNode } from "react";
import "./Eyebrow.css";

type EyebrowProps = {
  children: ReactNode;
  as?: "p" | "span";
  className?: string;
};

const Eyebrow = ({ children, as: Tag = "p", className }: EyebrowProps) => {
  const resolvedClass = className ? `eyebrow ${className}` : "eyebrow";
  return <Tag className={resolvedClass}>{children}</Tag>;
};

export default Eyebrow;
