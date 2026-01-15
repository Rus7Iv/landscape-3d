import type { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
};

const Tag = ({ children }: TagProps) => {
  return <span className="tag">{children}</span>;
};

export default Tag;
