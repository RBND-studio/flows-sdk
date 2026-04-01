import type { Survey, SurveyQuestion } from "@flows/shared";
import { useCallback, useEffect, useRef, useState } from "react";

// These durations must stay in sync with the animation durations in survey-popover.css
const TRANSITION_DURATION = 240;
const CLOSE_ANIMATION_DURATION = 160;
const AUTO_PROCEED_DURATION = 320;

interface UseSurveyPopoverOptions {
  survey: Survey;
  autoProceedAfterAnswer?: boolean;
}

export const useSurveyPopover = ({ survey, autoProceedAfterAnswer }: UseSurveyPopoverOptions) => {
  const [questionIndex, setQuestionIndex] = useState(survey.getCurrentQuestionIndex());
  const [isExiting, setIsExiting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number>(null);
  const autoProceedTimeoutRef = useRef<number>(null);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimeoutRef.current ?? undefined);
      clearTimeout(autoProceedTimeoutRef.current ?? undefined);
    };
  }, []);

  const isLastQuestion = questionIndex === survey.questions.length - 1;

  const handleClose = useCallback((fn: () => void) => {
    clearTimeout(closeTimeoutRef.current ?? undefined);
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(fn, CLOSE_ANIMATION_DURATION);
  }, []);

  const navigateTo = useCallback((nextIndex: number) => {
    const popover = popoverRef.current;
    const frozenHeight = popover?.offsetHeight ?? 0;
    if (popover) {
      popover.style.height = `${frozenHeight}px`;
    }
    setIsExiting(true);
    setTimeout(() => {
      setQuestionIndex(nextIndex);
      setIsExiting(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (popover) {
            // Temporarily lift the constraint to measure the new natural height,
            // then restore before animating so the transition has a valid start point.
            popover.style.height = "auto";
            const naturalHeight = popover.scrollHeight;
            popover.style.height = `${frozenHeight}px`;
            popover.getBoundingClientRect(); // force reflow
            popover.style.height = `${naturalHeight}px`;
          }
        });
      });
    }, TRANSITION_DURATION);
  }, []);

  const handleNextQuestion = useCallback(() => {
    navigateTo(survey.nextQuestion());
  }, [navigateTo, survey]);

  const handleAutoProceed = useCallback(
    ({ currentQuestion }: { currentQuestion: SurveyQuestion }) => {
      const hasOtherOption =
        currentQuestion.type === "single-choice" && !!currentQuestion.otherOption;

      if (autoProceedAfterAnswer && !isLastQuestion && !hasOtherOption) {
        clearTimeout(autoProceedTimeoutRef.current ?? undefined);
        autoProceedTimeoutRef.current = window.setTimeout(
          handleNextQuestion,
          AUTO_PROCEED_DURATION,
        );
      }
    },
    [autoProceedAfterAnswer, isLastQuestion, handleNextQuestion],
  );

  const handleHeightTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "height" && e.target === popoverRef.current) {
      popoverRef.current.style.height = "";
    }
  }, []);

  return {
    popoverRef,
    questionIndex,
    isExiting,
    isClosing,
    isLastQuestion,
    handleClose,
    handleNextQuestion,
    handleAutoProceed,
    handleHeightTransitionEnd,
  };
};
