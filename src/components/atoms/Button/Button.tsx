import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "ghost";
};

const Button = ({ variant, className, ...props }: ButtonProps) => {
  const variantClass = variant === "primary" ? "button--primary" : "button--ghost";
  const resolvedClass = className
    ? `button ${variantClass} ${className}`
    : `button ${variantClass}`;

  return <button className={resolvedClass} {...props} />;
};

export default Button;
