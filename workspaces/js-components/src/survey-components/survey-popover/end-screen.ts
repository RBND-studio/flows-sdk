import type { EndScreenQuestion } from "@flows/shared";
import { html } from "lit";
import { Button } from "../../internal-components/button";

type Props = {
  question: EndScreenQuestion;
  handleClose: () => void;
  autoCloseAfterSubmit?: boolean;
};

// The timeout should sync with the animation duration in survey-popover.css
export const AUTO_CLOSE_TIMEOUT = 3000;

export const EndScreen = ({ handleClose, question, autoCloseAfterSubmit }: Props) => {
  if (autoCloseAfterSubmit) {
    return html`<div class="flows_basicsV2_survey_popover_end_screen">
      <div class="flows_basicsV2_survey_popover_progress_bar">
        <div class="flows_basicsV2_survey_popover_progress_bar_fill"></div>
      </div>
    </div>`;
  }

  return Button({
    href: question.url || undefined,
    variant: "primary",
    target: question.openInNew ? "_blank" : undefined,
    className: "flows_basicsV2_survey_popover_link_button",
    onClick: handleClose,
    children: question.linkLabel,
  });
};
