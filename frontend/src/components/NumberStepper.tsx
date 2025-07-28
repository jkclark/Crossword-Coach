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
        className="btn btn-square btn-sm"
        onClick={onDecrement}
        aria-label="Decrement"
        disabled={!decrementEnabled}
      >
        -
      </button>
      <span className="mx-2 text-lg">{value}</span>
      <button
        className="btn btn-square btn-sm"
        onClick={onIncrement}
        aria-label="Increment"
        disabled={!incrementEnabled}
      >
        +
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
