import { useMemo, type FC } from "react";
import { type ComponentProps, type TooltipProps as LibraryTooltipProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

export const Tooltip: FC<TooltipProps> = (props) => {
  // const buttons = [];
  // if (props.continueText)
  //   buttons.push(
  //     <Button key="continue" variant="primary" onClick={props.continue}>
  //       {props.continueText}
  //     </Button>,
  //   );

  const buttons = useMemo(
    () =>
      props.buttons.map((b, i) => (
        <ActionButton
          action={b.action}
          variant={b.variant}
          // eslint-disable-next-line react/no-array-index-key -- no better key available
          key={i}
        />
      )),
    [props.buttons],
  );

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.showCloseButton ? props.close : undefined}
      // buttons={buttons.length ? buttons : undefined}
      buttons={buttons}
    />
  );
};
