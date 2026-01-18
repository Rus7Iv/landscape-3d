import Button from "../../atoms/Button";
import Eyebrow from "../../atoms/Eyebrow";
import Lead from "../../atoms/Lead";
import "../Section";
import "./ContactSection.css";

type ContactSectionProps = {
  onComingSoon: () => void;
};

const ContactSection = ({ onComingSoon }: ContactSectionProps) => {
  return (
    <section id="contact" className="section section--cta contact-section reveal">
      <div className="contact-section__card reveal__stagger reveal__stagger--delay-1">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h2>Ready to build a living landscape?</h2>
          <Lead>
            Tell us about your launch, product, or research lab. We will respond
            with a prototype outline and delivery timeline.
          </Lead>
        </div>
        <div className="contact-section__actions">
          <Button variant="primary" onClick={onComingSoon}>
            Start a project
          </Button>
          <Button variant="ghost" onClick={onComingSoon}>
            Download deck
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
