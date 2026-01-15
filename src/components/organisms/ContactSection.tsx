import Button from "../atoms/Button";
import Eyebrow from "../atoms/Eyebrow";

const ContactSection = () => {
  return (
    <section id="contact" className="section reveal cta">
      <div className="cta-card stagger delay-1">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h2>Ready to build a living landscape?</h2>
          <p className="section-lead">
            Tell us about your launch, product, or research lab. We will respond
            with a prototype outline and delivery timeline.
          </p>
        </div>
        <div className="cta-actions">
          <Button variant="primary">Start a project</Button>
          <Button variant="ghost">Download deck</Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
