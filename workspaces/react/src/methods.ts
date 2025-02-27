import { sendEvent } from "./lib/api";

/**
 * Reset progress for all workflows for the current user in the current environment.
 */
export const resetAllWorkflowsProgress = (): Promise<void> => sendEvent({ name: "reset-progress" });

/**
 * Reset progress of one workflow for the current user in the current environment.
 * @param workflowId - UUID of the workflow to reset progress for
 */
export const resetWorkflowProgress = (workflowId: string): Promise<void> =>
  sendEvent({ name: "reset-progress", workflowId });

export { useCurrentFloatingBlocks, useCurrentSlotBlocks } from "./hooks/use-current-blocks";
