import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useSetAtom } from "jotai";
import { currentEntryIndexAtom } from "../state";
import AnswerInputSquare from "./AnswerInputSquare";

const AnswerInput: React.FC<AnswerInputProps> = ({ answer }) => {
  const setCurrentEntryIndex = useSetAtom(currentEntryIndexAtom);
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
    /**
     * Check if the user input matches the answer.
     */
    const submitAnswer = () => {
      if (userInputRef.current.join("").toLowerCase() === answerRef.current.toLowerCase()) {
        clearInput();
        setCurrentEntryIndex((prev) => prev + 1);
        console.log("correct!");
      } else {
        console.log("wrong...");
      }
    };

    /**
     * Clear the input and reset the current square index to 0.
     */
    const clearInput = () => {
      setUserInput(Array(answerRef.current.length).fill(""));
      setCurrentSquareIndex(0);
    };

    /**
     * Handle keyboard input.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key.length === 1 && key >= "A" && key <= "Z") {
        insertLetter(key);
      } else if (event.key === "Backspace") {
        deleteLetter();
      } else if (event.key === "ArrowLeft") {
        moveLeft();
      } else if (event.key === "ArrowRight") {
        moveRight();
      } else if (event.key === "Enter") {
        submitAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentEntryIndex]);

  /**
   * Update the current square with the key pressed by the user.
   *
   * @param key The key pressed by the user.
   */
  const insertLetter = (key: string) => {
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
  const deleteLetter = () => {
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
  const moveLeft = () => {
    setCurrentSquareIndex((prev) => Math.max(prev - 1, 0));
  };

  /**
   * Navigate to the square to the right of the current square.
   */
  const moveRight = () => {
    setCurrentSquareIndex((prev) => Math.min(prev + 1, answerRef.current.length - 1));
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
