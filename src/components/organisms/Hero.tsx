import Button from "../atoms/Button";
import Eyebrow from "../atoms/Eyebrow";

type HeroProps = {
  onComingSoon: () => void;
};

const Hero = ({ onComingSoon }: HeroProps) => {

  return (
    <main className="hero">
      <Eyebrow>Realtime spatial experience</Eyebrow>
      <h1>Terrain that breathes. Motion that feels engineered.</h1>
      <p className="lead">
        A fast, GPU-friendly Three.js landscape built for modern storytelling.
        Responsive, cinematic, and tuned for smooth 60fps delivery.
      </p>
      <div className="actions">
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
