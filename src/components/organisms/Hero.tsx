import Button from "../atoms/Button";
import Eyebrow from "../atoms/Eyebrow";

const Hero = () => {
  return (
    <main className="hero">
      <Eyebrow>Realtime spatial experience</Eyebrow>
      <h1>Terrain that breathes. Motion that feels engineered.</h1>
      <p className="lead">
        A fast, GPU-friendly Three.js landscape built for modern storytelling.
        Responsive, cinematic, and tuned for smooth 60fps delivery.
      </p>
      <div className="actions">
        <Button variant="primary">Launch prototype</Button>
        <Button variant="ghost">View process</Button>
      </div>
    </main>
  );
};

export default Hero;
