import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAtomValue } from "jotai";
import { revealedLettersAtom } from "../state";
import { useEntries } from "../useEntries";
import { useScore } from "../useScore";
import AnswerInputSquare from "./AnswerInputSquare";

const AnswerInput: React.FC<AnswerInputProps> = ({
  answer,
  showOrFetchExplanation,
}) => {
  const { goToNextEntry } = useEntries();

  const [currentSquareIndex, setCurrentSquareIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>(
    Array(answer.length).fill(""),
  );
  const revealedLetters = useAtomValue(revealedLettersAtom);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const { setStreak, resetStreak, setCorrectScore, setTotalScore } = useScore();

  /* Animation */
  const [jumpingIndexes, setJumpingIndexes] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  /* Derived state */
  const allLettersRevealed = revealedIndexes.length >= answer.length; // In theory should never be greater than
  const userInputIsFull = userInput.every((char) => char !== "");
  const submitOrNextButtonDisabled = !allLettersRevealed && !userInputIsFull;

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
   * Get the index of the previous non-revealed square, or null if none exists.
   */
  const getPreviousNonRevealedIndex = useCallback(
    (index: number) => {
      let nextIndex = index - 1;

      /* Check indexes to the left until we find a non-revealed, in-bounds square */
      while (nextIndex >= 0 && revealedIndexes.includes(nextIndex)) {
        nextIndex--;
      }

      /* If we never find a non-revealed, in-bounds square, return null */
      if (nextIndex < 0) {
        return null;
      }

      /* Return the previous non-revealed, in-bounds square index */
      return nextIndex;
    },
    [revealedIndexes],
  );

  /**
   * Get the index of the next non-revealed square, or null if none exists.
   */
  const getNextNonRevealedIndex = useCallback(
    (current: number) => {
      let nextIndex = current + 1;

      /* Check indexes to the right until we find a non-revealed, in-bounds square */
      while (
        nextIndex < answerRef.current.length &&
        revealedIndexes.includes(nextIndex)
      ) {
        nextIndex++;
      }

      /* If we never find a non-revealed, in-bounds square, return the current index */
      if (nextIndex >= answerRef.current.length) {
        return null;
      }

      /* Return the next non-revealed, in-bounds square index */
      return nextIndex;
    },
    [revealedIndexes],
  );

  /**
   * Navigate to the square to the left of the current square, skipping revealed squares.
   */
  const moveLeft = useCallback(() => {
    setCurrentSquareIndex((prev) => getPreviousNonRevealedIndex(prev) ?? prev);
  }, [getPreviousNonRevealedIndex]);

  /**
   * Navigate to the square to the right of the current square, skipping revealed squares.
   */
  const moveRight = useCallback(() => {
    setCurrentSquareIndex((prev) => getNextNonRevealedIndex(prev) ?? prev);
  }, [getNextNonRevealedIndex]);

  /**
   * Update the current square with the key pressed by the user.
   *
   * @param key The key pressed by the user.
   */
  const insertLetter = useCallback(
    (key: string) => {
      setUserInput((prev) => {
        /* If the current square has already been revealed, do nothing */
        if (revealedIndexes.includes(currentSquareIndexRef.current)) {
          return prev;
        }

        const newInput = [...prev];
        newInput[currentSquareIndexRef.current] = key;
        return newInput;
      });

      /* Move the current square to the next non-revealed square */
      moveRight();
    },
    [revealedIndexes, moveRight],
  );

  /**
   * Clear the current square, or move left and clear that square if the current square is already empty.
   */
  const deleteLetter = useCallback(() => {
    const index = currentSquareIndexRef.current;

    /* If the current square is revealed, do nothing */
    if (revealedIndexes.includes(index)) {
      console.log(`Square ${index} is revealed, skipping deletion`);
      return;
    }

    /* If the current square is not empty, clear it */
    if (userInputRef.current[index] !== "") {
      setUserInput((prev) => {
        const newInput = [...prev];
        newInput[index] = "";
        return newInput;
      });
      return;
    }

    /* If the current square is empty, clear the previous square and move left */
    const previousIndex = getPreviousNonRevealedIndex(index);
    if (previousIndex !== null) {
      setUserInput((prev) => {
        const newInput = [...prev];
        newInput[previousIndex] = "";
        return newInput;
      });

      // NOTE: This could equivalently be done with `setCurrentSquareIndex(previousIndex)`,
      moveLeft();
    }
  }, [revealedIndexes, getPreviousNonRevealedIndex, moveLeft]);

  /**
   * Get ready for the next entry.
   */
  const goNext = useCallback(() => {
    /* Update score and streak */
    if (allLettersRevealed) {
      resetStreak();

      setTotalScore((prev) => prev + 1);
    } else {
      setStreak((prev) => prev + 1);
      setCorrectScore((prev) => prev + 1);
      setTotalScore((prev) => prev + 1);
    }

    // NOTE: We don't have to reset the user input, current square index, or revealed indexes
    // here, because the user input and the current square index are reset in
    // the parent component when the entry (and thus this component's key) changes,
    // unmounting and remounting this component.
    /* Update the current entry index and page */
    goToNextEntry();
  }, [
    allLettersRevealed,
    resetStreak,
    setStreak,
    setCorrectScore,
    setTotalScore,
    goToNextEntry,
  ]);

  /**
   * Check if the user input matches the answer.
   */
  const submitAnswer = useCallback(() => {
    /* If the answer is correct, animate the answer and go to the next entry */
    if (
      userInputRef.current.join("").toLowerCase() ===
      answerRef.current.toLowerCase()
    ) {
      const delayBetweenJumps = 70; // milliseconds

      /* Animate the answer */
      animateCorrectAnswer(delayBetweenJumps);

      /* After animation, go to next entry */
      setTimeout(
        () => {
          goNext();
        },
        answerRef.current.length * delayBetweenJumps + 400,
      ); // Wait for all jumps to finish
    } else {
      /* If the answer is incorrect, shake the answer */
      setIsShaking(true);
      // 400ms duration is defined in animate-shake in index.css
      setTimeout(() => setIsShaking(false), 400);
    }
  }, [goNext]);

  const revealAllLetters = useCallback(() => {
    /* If all letters are already revealed, do nothing */
    if (allLettersRevealed) return;

    /* Reveal all letters */
    const newRevealedIndexes = answerRef.current.split("").map((_, idx) => idx);
    setRevealedIndexes(newRevealedIndexes);

    /* Update the user input to match the answer */
    setUserInput(answerRef.current.split(""));

    /* Reset the current square index */
    setCurrentSquareIndex(0);
  }, [allLettersRevealed]);

  const revealAllLettersOrGoNext = useCallback(() => {
    if (!allLettersRevealed) {
      revealAllLetters();
    } else {
      goNext();
    }
  }, [allLettersRevealed, revealAllLetters, goNext]);

  const submitAnswerOrGoNext = useCallback(() => {
    // If the user typed in an answer and they haven't given up yet, submit it
    if (userInputIsFull && !allLettersRevealed) {
      submitAnswer();
    }

    // If the user already gave up, go to the next entry
    else if (allLettersRevealed) {
      goNext();
    }
  }, [userInputIsFull, allLettersRevealed, submitAnswer, goNext]);

  // Reveal initial letters based on revealedLetters
  useEffect(() => {
    if (revealedLetters > 0 && answer.length > 0) {
      /* Pick random unique indexes to reveal */
      const numToReveal = Math.min(revealedLetters, answer.length);
      const allIndexes = Array.from({ length: answer.length }, (_, i) => i);
      const shuffled = allIndexes.sort(() => Math.random() - 0.5);
      const initialRevealed = shuffled.slice(0, numToReveal);

      /* Set the revealed indexes and user input based on the initial revealed letters */
      setRevealedIndexes(initialRevealed);

      /* Set the user input to match the answer, filling in revealed letters */
      setUserInput(() => {
        const newInput = Array(answer.length).fill("");
        for (const idx of initialRevealed) {
          newInput[idx] = answer[idx];
        }
        return newInput;
      });

      /* Set current square index to the left-most unrevealed index, or 0 if all revealed */
      // NOTE: If all are revealed, it doesn't really matter what we set this to
      let leftMostUnrevealed = 0;
      for (let i = 0; i < answer.length; i++) {
        if (!initialRevealed.includes(i)) {
          leftMostUnrevealed = i;
          break;
        }
      }
      setCurrentSquareIndex(leftMostUnrevealed);
    }
  }, [answer, revealedLetters]);

  /* Handle keyboard input */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore input if Ctrl or Meta (Command) key is pressed
      if (event.ctrlKey || event.metaKey) return;

      const key = event.key.toUpperCase();

      /* Handle the Enter key */
      if (event.key === "Enter") {
        event.preventDefault();
        submitAnswerOrGoNext();
        return;
      }

      /* Handle the spacebar */
      if (event.code === "Space" || event.key === " ") {
        revealAllLettersOrGoNext();
        return;
      }

      /* If the user has given up, ignore all other keys */
      if (allLettersRevealed) return;

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
  }, [
    submitAnswer,
    moveLeft,
    moveRight,
    insertLetter,
    deleteLetter,
    allLettersRevealed,
    userInputIsFull,
    revealAllLettersOrGoNext,
    submitAnswerOrGoNext,
  ]);

  const animateCorrectAnswer = (delayBetweenJumps: number) => {
    for (let i = 0; i < answerRef.current.length; i++) {
      setTimeout(() => {
        setJumpingIndexes((prev) => [...prev, i]);
      }, i * delayBetweenJumps); // 120ms delay between jumps
    }
  };

  return (
    <>
      <div
        className={`mb-5 flex justify-center ${isShaking ? "animate-shake" : ""}`}
      >
        {answer.split("").map((char, idx) => (
          <AnswerInputSquare
            key={idx}
            value={userInput[idx]}
            selected={currentSquareIndex === idx}
            answer={char}
            revealed={revealedIndexes.includes(idx)}
            jumping={jumpingIndexes.includes(idx)}
            className={`border-2 ${idx !== 0 ? "border-l-0" : ""}`}
          />
        ))}
      </div>

      <div className="flex flex-row justify-center gap-2">
        {allLettersRevealed ? (
          <button
            className="btn py-[0.5em] text-[clamp(0.5rem,2vw,1.5rem)]"
            onClick={showOrFetchExplanation}
          >
            I don't understand
          </button>
        ) : (
          <button
            className="btn py-[0.5em] text-[clamp(0.5rem,2vw,1.5rem)]"
            onClick={revealAllLetters}
            disabled={allLettersRevealed}
          >
            Give up
          </button>
        )}

        <button
          className="btn py-[0.5em] text-[clamp(0.5rem,2vw,1.5rem)]"
          onClick={submitAnswerOrGoNext}
          disabled={submitOrNextButtonDisabled}
        >
          <ArrowRightCircleIcon className="size-7" />
        </button>
      </div>
    </>
  );
};

interface AnswerInputProps {
  answer: string;
  showOrFetchExplanation: () => void;
}

export default AnswerInput;
