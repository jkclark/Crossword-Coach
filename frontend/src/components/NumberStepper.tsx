import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type React from "react";

const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  incrementEnabled,
  onIncrement,
  decrementEnabled,
  onDecrement,
  className,
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <button
        className="btn btn-square btn-xs"
        onClick={onDecrement}
        aria-label="Decrement"
        disabled={!decrementEnabled}
      >
        <ChevronDownIcon className="size-5" />
      </button>
      <span className="mx-2 w-6 text-center text-lg select-none">{value}</span>
      <button
        className="btn btn-square btn-xs"
        onClick={onIncrement}
        aria-label="Increment"
        disabled={!incrementEnabled}
      >
        <ChevronUpIcon className="size-5" />
      </button>
    </div>
  );
};

interface NumberStepperProps {
  value: number;
  incrementEnabled: boolean;
  onIncrement: () => void;
  decrementEnabled?: boolean;
  onDecrement: () => void;
  className?: string;
}

export default NumberStepper;
