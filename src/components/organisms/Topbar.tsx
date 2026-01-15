import Brand from "../molecules/Brand";
import Button from "../atoms/Button";

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
      <Button variant="ghost">Book a demo</Button>
    </header>
  );
};

export default Topbar;
