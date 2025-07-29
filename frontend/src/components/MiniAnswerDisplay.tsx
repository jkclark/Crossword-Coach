import AnswerInputSquare from "./AnswerInputSquare";

const MiniAnswerDisplay: React.FC<MiniAnswerDisplayProps> = ({
  length,
  values,
}) => {
  const squarePropsBase = {
    value: "",
    selected: false,
    answer: "",
    hoverable: false,
    jumping: false,
  };

  return (
    <div className="mt-2 flex flex-row">
      {Array.from({ length }).map((_, idx) => (
        <AnswerInputSquare
          {...squarePropsBase}
          key={idx}
          className={`settings-mini-answer-square ${idx !== 0 ? "border-l-0" : ""}`}
          answer={values ? values[idx] : ""}
          revealed={(values && !!values[idx]) || false}
        />
      ))}
    </div>
  );
};

interface MiniAnswerDisplayProps {
  length: number;
  values?: string[];
}

export default MiniAnswerDisplay;
