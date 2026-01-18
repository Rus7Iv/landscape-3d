import type { ReactNode } from "react";
import "./Tag.css";

type TagProps = {
  children: ReactNode;
  as?: "span" | "p";
  className?: string;
};

const Tag = ({ children, as: TagElement = "span", className }: TagProps) => {
  const resolvedClass = className ? `tag ${className}` : "tag";
  return <TagElement className={resolvedClass}>{children}</TagElement>;
};

export default Tag;
