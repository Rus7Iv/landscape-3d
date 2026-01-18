import Brand from "../molecules/Brand";
import { Link } from "react-router-dom";

const Topbar = () => {
  return (
    <header className="topbar">
      <Brand />
      <nav className="nav">
        <a href="#studio">Studio</a>
        <a href="#work">Work</a>
        <a href="#tech">Tech</a>
        <a href="#labs">Labs</a>
        <a href="#contact">Contact</a>
      </nav>
      <Link className="ghost-button" to="/solar-system">
        Solar system
      </Link>
    </header>
  );
};

export default Topbar;
