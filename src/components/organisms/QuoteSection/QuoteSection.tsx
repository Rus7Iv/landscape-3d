import Eyebrow from "../../atoms/Eyebrow";
import Lead from "../../atoms/Lead";
import "../Section";
import "./QuoteSection.css";

const QuoteSection = () => {
  return (
    <section className="section section--quote quote-section reveal">
      <div className="quote-section__card reveal__stagger reveal__stagger--delay-1">
        <Eyebrow>Field note</Eyebrow>
        <h2>"Make the user feel like they are gliding."</h2>
        <Lead>
          That is the rule we follow when shaping the camera, easing the
          scroll, and layering motion in the background.
        </Lead>
      </div>
    </section>
  );
};

export default QuoteSection;
