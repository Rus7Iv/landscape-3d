import Eyebrow from "../atoms/Eyebrow";

const QuoteSection = () => {
  return (
    <section className="section reveal quote">
      <div className="quote-card stagger delay-1">
        <Eyebrow>Field note</Eyebrow>
        <h2>"Make the user feel like they are gliding."</h2>
        <p className="section-lead">
          That is the rule we follow when shaping the camera, easing the
          scroll, and layering motion in the background.
        </p>
      </div>
    </section>
  );
};

export default QuoteSection;
