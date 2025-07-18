import { useTypedOutText } from "../useTypedOutText";

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
}) => {
  const typedOutText = useTypedOutText(explanation, 30);

  return <div>{typedOutText}</div>;
};

interface ExplanationDisplayProps {
  explanation: string;
}

export default ExplanationDisplay;
