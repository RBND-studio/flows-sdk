import { template } from "../template";
import type { Action, PropertyMeta, UserProperties } from "../types";

export const createActionBase = ({
  propMeta,
  userProperties,
}: {
  propMeta: PropertyMeta & { type: "action" };
  userProperties: UserProperties;
}): Action => {
  const actionValue = propMeta.value;

  const propValue: Action = {
    label: template(actionValue.label, userProperties),
    openInNew: actionValue.openInNew,
  };
  if (actionValue.url !== undefined) {
    propValue.url = template(actionValue.url, userProperties);
  }

  return propValue;
};
