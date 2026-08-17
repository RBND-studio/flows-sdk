import type { Block, TourStep, TourTriggerExpression } from "@flows/shared";
import type { Page } from "@playwright/test";
import { randomUUID } from "crypto";

export const mockBlocksEndpoint = async (
  page: Page,
  blocks: Block[],
  options?: { free_org?: boolean; tour_concurrency?: boolean },
): Promise<void> => {
  const { free_org = false, tour_concurrency = false } = options ?? {};

  await page.route("**/v2/sdk/blocks", async (route) => {
    await route.fulfill({ json: { blocks, meta: { free_org, tour_concurrency } } });
  });
};

export const getBlock = ({
  componentType = "BasicsV2Modal",
}: {
  componentType?: string;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType,
  data: {},
  exitNodes: [],
  slottable: false,
});

export const getTour = ({
  tourBlocks,
  tour_trigger,
  tourSessionEndAction,
}: {
  tourBlocks: TourStep[];
  tour_trigger?: TourTriggerExpression[];
  tourSessionEndAction?: string;
}): Block => ({
  id: randomUUID(),
  blockStateId: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  tourBlocks,
  tour_trigger: tour_trigger ? { $and: tour_trigger } : undefined,
  tourSessionEndAction,
});

export const getTourStep = ({
  componentType = "BasicsV2Modal",
  key,
  data = {},
}: {
  componentType?: string;
  key?: string;
  data?: Record<string, unknown>;
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  data,
  key,
  slottable: false,
  type: "tour-component",
  componentType,
});
