import Eyebrow from "../../atoms/Eyebrow";
import Lead from "../../atoms/Lead";
import "./SectionHead.css";

type SectionHeadProps = {
  eyebrow: string;
  title: string;
  lead: string;
};

const SectionHead = ({ eyebrow, title, lead }: SectionHeadProps) => {
  return (
    <div className="section-head">
      <Eyebrow className="section-head__eyebrow">{eyebrow}</Eyebrow>
      <h2 className="section-head__title">{title}</h2>
      <Lead className="section-head__lead">{lead}</Lead>
    </div>
  );
};

export default SectionHead;
