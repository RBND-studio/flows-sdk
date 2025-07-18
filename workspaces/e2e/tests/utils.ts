import { Block } from "@flows/shared";
import { Page } from "@playwright/test";

export const mockBlocksEndpoint = async (page: Page, blocks: Block[]): Promise<void> => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks } });
  });
};
