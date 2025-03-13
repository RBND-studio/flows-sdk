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

/**
 * Start a workflow from a manual start block. The workflow will only start if:
 * - Workflow is published in the current environment
 * - Workflow has a manual start block with a matching block key
 * - The current user can access the workflow based on the frequency setting
 * - The current user matches the start block's user property conditions
 * @param blockKey - block key of the manual start block
 */
export const startWorkflow = (blockKey: string): Promise<void> =>
  sendEvent({ name: "workflow-start", blockKey });

export { useCurrentFloatingBlocks, useCurrentSlotBlocks } from "./hooks/use-current-blocks";
