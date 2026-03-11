import type { EndScreenQuestion } from "@flows/shared/src/types/survey";
import { Button } from "../../internal-components/button";
import { useEffect } from "react";

type Props = {
  currentQuestion: EndScreenQuestion;
  handleLinkClick: () => void;
  submit: () => void;
  autoCloseAfterSubmit?: boolean;
};

// The timeout should sync with the animation duration in survey-popover.css
const AUTO_CLOSE_TIMEOUT = 3000;

export const EndScreen = ({
  currentQuestion,
  handleLinkClick,
  submit,
  autoCloseAfterSubmit,
}: Props) => {
  useEffect(() => {
    if (autoCloseAfterSubmit) {
      const timeout = setTimeout(() => {
        submit();
      }, AUTO_CLOSE_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [submit, autoCloseAfterSubmit]);

  if (autoCloseAfterSubmit) {
    return (
      <div className="flows_basicsV2_survey_popover_end_screen">
        <div className="flows_basicsV2_survey_popover_progress_bar">
          <div className="flows_basicsV2_survey_popover_progress_bar_fill" />
        </div>
      </div>
    );
  }

  return (
    <Button
      href={currentQuestion.url ? currentQuestion.url : undefined}
      variant="primary"
      target={currentQuestion.openInNew ? "_blank" : undefined}
      className="flows_basicsV2_survey_popover_link_button"
      onClick={() => {
        handleLinkClick();
      }}
    >
      {currentQuestion.linkLabel}
    </Button>
  );
};
