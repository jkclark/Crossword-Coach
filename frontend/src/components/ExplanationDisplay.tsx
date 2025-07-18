import { useAtomValue } from "jotai";
import { isExplanationLoadingAtom } from "../state";
import { useMinimumLoading } from "../useMinimumLoading";
import { useTypedOutText } from "../useTypedOutText";

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
}) => {
  /* Is the explanation currently loading? */
  const isExplanationLoading = useAtomValue(isExplanationLoadingAtom);

  /* Should we show a loading state? */
  // Even if we have the explanation right away, we want to show a loading state
  // because it's jarring otherwise.
  const MINIMUM_LOADING_TIME = 2000;
  const showLoading = useMinimumLoading(
    isExplanationLoading,
    MINIMUM_LOADING_TIME,
  );
  // Only start typing after loading is done
  const TYPING_SPEED = 30; // ms per character
  const typedText = useTypedOutText(
    showLoading ? null : explanation,
    TYPING_SPEED,
  );

  if (showLoading) {
    return <div>Loading explanation…</div>;
  }
  return <div>{typedText}</div>;
};

interface ExplanationDisplayProps {
  explanation: string | null;
}

export default ExplanationDisplay;
