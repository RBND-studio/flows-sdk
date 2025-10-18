import { Block, TourStep } from "@flows/shared";
import { Page } from "@playwright/test";
import { randomUUID } from "crypto";

export const mockBlocksEndpoint = async (page: Page, blocks: Block[]): Promise<void> => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks } });
  });
};

export const getTour = ({ tourBlocks }: { tourBlocks: TourStep[] }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  tourBlocks,
});
