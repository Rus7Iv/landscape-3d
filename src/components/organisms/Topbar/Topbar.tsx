import Brand from "../../molecules/Brand";
import { Link } from "react-router-dom";
import "../../atoms/Button/Button.css";
import "./Topbar.css";

const Topbar = () => {
  const navItems = [
    { href: "#studio", label: "Studio" },
    { href: "#work", label: "Work" },
    { href: "#tech", label: "Tech" },
    { href: "#labs", label: "Labs" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="topbar">
      <Brand />
      <nav className="topbar__nav">
        {navItems.map((item) => (
          <a key={item.href} className="topbar__link" href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <Link className="button button--ghost topbar__cta" to="/solar-system">
        Solar system
      </Link>
    </header>
  );
};

export default Topbar;
