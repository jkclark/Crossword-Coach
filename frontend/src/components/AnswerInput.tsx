import type React from "react";
import { useEffect, useRef, useState } from "react";

import AnswerInputSquare from "./AnswerInputSquare";

const AnswerInput: React.FC<AnswerInputProps> = ({ answer }) => {
  const [currentSquareIndex, setCurrentSquareIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>(Array(answer.length).fill(""));

  /* Refs to always have latest values in the event handler */
  const currentSquareIndexRef = useRef(currentSquareIndex);
  const answerRef = useRef(answer);
  const userInputRef = useRef(userInput);

  /* Update refs whenever the state changes */
  useEffect(() => {
    currentSquareIndexRef.current = currentSquareIndex;
    answerRef.current = answer;
    userInputRef.current = userInput;
  }, [currentSquareIndex, answer, userInput]);

  /* Handle keyboard input */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key.length === 1 && key >= "A" && key <= "Z") {
        handleAToZInput(key);
      } else if (event.key === "Backspace") {
        handleBackspace();
      } else if (event.key === "ArrowLeft") {
        handleLeftArrow();
      } else if (event.key === "ArrowRight") {
        handleRightArrow();
      } else if (event.key === "Enter") {
        handleEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**
   * Update the current square with the key pressed by the user.
   *
   * @param key The key pressed by the user.
   */
  const handleAToZInput = (key: string) => {
    setUserInput((prev) => {
      const newInput = [...prev];
      newInput[currentSquareIndexRef.current] = key;
      return newInput;
    });

    setCurrentSquareIndex((prev) => Math.min(prev + 1, answerRef.current.length - 1));
  };

  /**
   * Clear the current square, or move left and clear that square if the current square is already empty.
   */
  const handleBackspace = () => {
    setUserInput((prev) => {
      const newInput = [...prev];
      const idx = currentSquareIndexRef.current;
      if (newInput[idx] === "" && idx > 0) {
        // Move left and clear previous square
        newInput[idx - 1] = "";
        setCurrentSquareIndex(idx - 1);
      } else {
        // Clear current square
        newInput[idx] = "";
      }
      return newInput;
    });
  };

  /**
   * Navigate to the square to the left of the current square.
   */
  const handleLeftArrow = () => {
    setCurrentSquareIndex((prev) => Math.max(prev - 1, 0));
  };

  /**
   * Navigate to the square to the right of the current square.
   */
  const handleRightArrow = () => {
    setCurrentSquareIndex((prev) => Math.min(prev + 1, answerRef.current.length - 1));
  };

  /**
   * Check if the user input matches the answer.
   */
  const handleEnter = () => {
    if (userInputRef.current.join("").toLowerCase() === answerRef.current.toLowerCase()) {
      console.log("correct!");
    } else {
      console.log("wrong...");
    }
  };

  return (
    <div className="flex justify-center">
      {answer.split("").map((_, idx) => (
        <AnswerInputSquare key={idx} value={userInput[idx]} selected={currentSquareIndex === idx} />
      ))}
    </div>
  );
};

interface AnswerInputProps {
  answer: string;
}

export default AnswerInput;
