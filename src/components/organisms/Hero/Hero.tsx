import Button from "../../atoms/Button";
import Eyebrow from "../../atoms/Eyebrow";
import Lead from "../../atoms/Lead";
import "./Hero.css";

type HeroProps = {
  onComingSoon: () => void;
};

const Hero = ({ onComingSoon }: HeroProps) => {
  return (
    <main className="hero">
      <Eyebrow>Realtime spatial experience</Eyebrow>
      <h1 className="hero__title">Terrain that breathes. Motion that feels engineered.</h1>
      <Lead size="large" className="hero__lead">
        A fast, GPU-friendly Three.js landscape built for modern storytelling.
        Responsive, cinematic, and tuned for smooth 60fps delivery.
      </Lead>
      <div className="hero__actions">
        <Button variant="primary" onClick={onComingSoon}>
          Launch prototype
        </Button>
        <Button variant="ghost" onClick={onComingSoon}>
          View process
        </Button>
      </div>
    </main>
  );
};

export default Hero;
