import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "ghost";
};

const Button = ({ variant, className, ...props }: ButtonProps) => {
  const baseClass = variant === "primary" ? "primary-button" : "ghost-button";
  const resolvedClass = className ? `${baseClass} ${className}` : baseClass;

  return <button className={resolvedClass} {...props} />;
};

export default Button;
