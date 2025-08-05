import type React from "react";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({
  value,
  selected,
  answer,
  hoverable,
  revealed,
  jumping,
  className,
  onSelect,
}) => {
  const classNames = [
    "border-secondary",
    "flex",
    "aspect-square",
    "items-center",
    "justify-center",
    "border-2",
    "font-bold",
    "transition-transform",
    "duration-150",
    "ease-in-out",
    "select-none",
    "bg-base-100",
  ];

  /* Revealed? */
  if (revealed) {
    classNames.push("text-base-content");
  } else {
    classNames.push("text-secondary");
    if (selected) {
      classNames.push("bg-primary text-primary-content");
    }

    if (hoverable) {
      classNames.push("hover:bg-primary");
    }
  }

  /* Jumping */
  if (jumping) {
    classNames.push("animate-jump");
  }

  /* Custom className */
  if (className) {
    classNames.push(className);
  }

  return (
    <div
      className={classNames.join(" ")}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      aria-label={revealed ? answer : value}
    >
      <span className={`${revealed ? "fade-in" : ""}`}>
        {revealed ? answer : value}
      </span>
    </div>
  );
};

interface AnswerInputSquareProps {
  value: string;
  selected: boolean;
  answer: string;
  hoverable: boolean;
  revealed: boolean;
  jumping: boolean;
  className: string;
  onSelect?: () => void;
}

export default AnswerInputSquare;
