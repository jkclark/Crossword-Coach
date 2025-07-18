import { useAtomValue } from "jotai";
import { displayExplanationAtom } from "../state";
import { useTypedOutText } from "../useTypedOutText";

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
}) => {
  const displayExplanation = useAtomValue(displayExplanationAtom);
  const displayOrVoid = useTypedOutText(
    displayExplanation ? explanation : "",
    30,
  );

  return <div>{displayOrVoid}</div>;
};

interface ExplanationDisplayProps {
  explanation: string;
}

export default ExplanationDisplay;
