const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
}) => {
  return <div>{explanation}</div>;
};

interface ExplanationDisplayProps {
  explanation: string | null;
}

export default ExplanationDisplay;
