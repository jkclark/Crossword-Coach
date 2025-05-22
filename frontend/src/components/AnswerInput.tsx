import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAtom, useSetAtom } from "jotai";
import { currentEntryIndexAtom, userGaveUpAtom } from "../state";
import AnswerInputSquare from "./AnswerInputSquare";

const AnswerInput: React.FC<AnswerInputProps> = ({ answer }) => {
  const setCurrentEntryIndex = useSetAtom(currentEntryIndexAtom);
  const [currentSquareIndex, setCurrentSquareIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>(Array(answer.length).fill(""));
  const [userGaveUp, setUserGaveUp] = useAtom(userGaveUpAtom);

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

  /**
   * Check if the user input matches the answer.
   */
  const submitAnswer = useCallback(() => {
    if (userInputRef.current.join("").toLowerCase() === answerRef.current.toLowerCase()) {
      setCurrentEntryIndex((prev) => prev + 1);
      console.log("correct!");
    } else {
      console.log("wrong...");
    }
  }, [setCurrentEntryIndex]);

  /**
   * Handle the case when the user gives up.
   */
  const giveUp = useCallback(() => {
    setUserGaveUp(true);
  }, [setUserGaveUp]);

  /**
   * Get ready for the next entry.
   */
  const goToNextEntry = useCallback(() => {
    setUserGaveUp(false);
    setCurrentEntryIndex((prev) => prev + 1);
  }, [setUserGaveUp, setCurrentEntryIndex]);

  const giveUpOrGoNext = useCallback(() => {
    if (!userGaveUp) {
      giveUp();
    } else {
      goToNextEntry();
    }
  }, [giveUp, goToNextEntry, userGaveUp]);

  const userInputIsFull = userInput.every((char) => char !== "");

  const submitAnswerOrGoNext = useCallback(() => {
    // If the user typed in an answer and they haven't given up yet, submit it
    if (userInputIsFull && !userGaveUp) {
      submitAnswer();
    }

    // If the user already gave up, go to the next entry
    else if (userGaveUp) {
      goToNextEntry();
    }
  }, [userInputIsFull, userGaveUp, submitAnswer, goToNextEntry]);

  /* Handle keyboard input */
  useEffect(() => {
    /**
     * Handle keyboard input.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore input if Ctrl or Meta (Command) key is pressed
      if (event.ctrlKey || event.metaKey) return;

      const key = event.key.toUpperCase();

      /* Handle the Enter key */
      if (event.key === "Enter") {
        submitAnswerOrGoNext();
        return;
      }

      /* Handle the spacebar */
      if (event.code === "Space" || event.key === " ") {
        giveUpOrGoNext();
        return;
      }

      /* If the user has given up, ignore all other keys */
      if (userGaveUp) return;

      if (key.length === 1 && key >= "A" && key <= "Z") {
        insertLetter(key);
      } else if (event.key === "Backspace") {
        deleteLetter();
      } else if (event.key === "ArrowLeft") {
        moveLeft();
      } else if (event.key === "ArrowRight") {
        moveRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitAnswer, userInputIsFull, userGaveUp, giveUpOrGoNext, submitAnswerOrGoNext]);

  return (
    <div>
      <div className="flex justify-center mb-5">
        {answer.split("").map((char, idx) => (
          <AnswerInputSquare
            key={idx}
            value={userInput[idx]}
            selected={currentSquareIndex === idx}
            answer={char}
          />
        ))}
      </div>

      {!userGaveUp && (
        <button className="btn mr-2 py-[1em] text-[clamp(0.5rem,2vw,1.5rem)]" onClick={giveUp}>
          I don't know
        </button>
      )}

      {!userGaveUp && (
        <button
          className="btn ml-2 text-[clamp(0.5rem,2vw,1.5rem)]"
          onClick={submitAnswer}
          disabled={!userInputIsFull}
        >
          Submit
        </button>
      )}

      {userGaveUp && (
        <button className="btn text-[clamp(0.5rem,2vw,1.5rem)]" onClick={goToNextEntry}>
          Next
        </button>
      )}
    </div>
  );
};

interface AnswerInputProps {
  answer: string;
}

export default AnswerInput;
