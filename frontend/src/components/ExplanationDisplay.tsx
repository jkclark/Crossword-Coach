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

  /* Type out the explanation text like ChatGPT does */
  const TYPING_SPEED = 30; // ms per character
  // Only start typing after loading is done
  const typedText = useTypedOutText(
    showLoading ? null : explanation,
    TYPING_SPEED,
  );

  if (!explanation && !showLoading) {
    return null;
  }

  const loadingDiv = (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="text-3xl">Understanding clue and answer...</div>
      <div className="loading loading-dots text-primary loading-xl"></div>
    </div>
  );

  const typedTextDiv = <div className="text-left text-xl">{typedText}</div>;

  const innerDivToShow = showLoading ? loadingDiv : typedTextDiv;

  return (
    <div className="bg-base-200 mx-auto mt-3 h-50 w-[500px] rounded-xl p-3 text-left text-xl">
      {innerDivToShow}
    </div>
  );
};

interface ExplanationDisplayProps {
  explanation: string | null;
}

export default ExplanationDisplay;
