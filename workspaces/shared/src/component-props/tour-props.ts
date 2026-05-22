import { mapValues } from "es-toolkit";
import { template } from "../template";
import type { TourComponentProps, TourStep, UserProperties } from "../types";
import { createActionBase } from "./component-props-shared";
import { set } from "es-toolkit/compat";

export const createTourComponentProps = ({
  tourSteps,
  tourStep,
  currentIndex,
  userProperties,
  handleCancel,
  handleContinue,
  handlePrevious,
}: {
  tourSteps: TourStep[];
  tourStep: TourStep;
  currentIndex: number;
  userProperties: UserProperties;
  handleContinue: () => void;
  handlePrevious: () => void;
  handleCancel: () => void;
}): TourComponentProps<object> => {
  const isFirstStep = currentIndex === 0;

  const processData = (value: unknown): unknown => {
    if (typeof value === "string") {
      return template(value, userProperties);
    }
    if (Array.isArray(value)) {
      return value.map((item: unknown) => {
        if (item && typeof item === "object") {
          return mapValues(item, processData);
        }

        return item;
      });
    }

    return value;
  };

  const data = mapValues(tourStep.data, processData);

  for (const propMeta of tourStep.propertyMeta ?? []) {
    if (propMeta.type === "action") {
      const propValue = createActionBase({ propMeta, userProperties });

      if (propMeta.value.exitNode) {
        // eslint-disable-next-line @typescript-eslint/require-await -- needed for the callAction to return Promise
        propValue.callAction = async () => {
          if (propMeta.value.exitNode === "continue") handleContinue();
          if (propMeta.value.exitNode === "previous") handlePrevious();
          if (propMeta.value.exitNode === "cancel") handleCancel();
        };
      }

      set(data, propMeta.key, propValue);
    }
  }

  const visibleTourSteps = tourSteps.filter((s) => s.type === "tour-component");
  const tourVisibleStepIndex = visibleTourSteps.findIndex((s) => s.id === tourStep.id);

  return {
    __flows: {
      id: tourStep.id,
      key: tourStep.key,
      workflowId: tourStep.workflowId,
      tourVisibleStepCount: visibleTourSteps.length,
      tourVisibleStepIndex,
    },
    ...data,
    continue: handleContinue,
    previous: !isFirstStep ? handlePrevious : undefined,
    cancel: handleCancel,
  };
};
