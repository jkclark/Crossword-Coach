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

  /* Hoverable? */
  if (hoverable) {
    classNames.push("hover:scale-120", "hover:border-3");

    if (!revealed) {
      classNames.push("hover:bg-primary");
    }
  }

  /* Revealed? */
  if (revealed) {
    classNames.push("text-base-content");
  } else {
    classNames.push("text-secondary");
    if (selected) {
      classNames.push("bg-primary text-primary-content");
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
      {revealed ? answer : value}
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
