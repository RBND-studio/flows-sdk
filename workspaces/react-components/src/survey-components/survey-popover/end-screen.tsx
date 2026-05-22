import { SURVEY_POPOVER_AUTO_CLOSE_TIMEOUT, type EndScreenQuestion } from "@flows/shared";
import { Button } from "../../internal-components/button";
import { useEffect } from "react";

type Props = {
  question: EndScreenQuestion;
  handleClose: () => void;
  autoCloseAfterSubmit?: boolean;
};

export const EndScreen = ({ question, handleClose, autoCloseAfterSubmit }: Props) => {
  useEffect(() => {
    if (autoCloseAfterSubmit) {
      const timeout = setTimeout(() => {
        handleClose();
      }, SURVEY_POPOVER_AUTO_CLOSE_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [handleClose, autoCloseAfterSubmit]);

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
      href={question.url || undefined}
      variant="primary"
      target={question.openInNew ? "_blank" : undefined}
      className="flows_basicsV2_survey_popover_link_button"
      onClick={handleClose}
    >
      {question.linkLabel}
    </Button>
  );
};
