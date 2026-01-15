import Eyebrow from "../atoms/Eyebrow";

type SectionHeadProps = {
  eyebrow: string;
  title: string;
  lead: string;
};

const SectionHead = ({ eyebrow, title, lead }: SectionHeadProps) => {
  return (
    <div className="section-head">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      <p className="section-lead">{lead}</p>
    </div>
  );
};

export default SectionHead;
