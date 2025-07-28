import AnswerInputSquare from "./AnswerInputSquare";

const MiniAnswerDisplay: React.FC<MiniAnswerDisplayProps> = ({
  length,
  revealedIndexes,
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
          revealed={(revealedIndexes && revealedIndexes.includes(idx)) || false}
        />
      ))}
    </div>
  );
};

interface MiniAnswerDisplayProps {
  length: number;
  revealedIndexes?: number[];
}

export default MiniAnswerDisplay;
