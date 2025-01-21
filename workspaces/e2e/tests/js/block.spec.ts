import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

const mockBlock = {
  id: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: {},
  exitNodes: [],
  slottable: false,
};

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

test("return empty blocks", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [] } });
  });
  await page.goto(`/js/block/block.html`);
  await expect(page.getByText("Floating blocks changed")).toHaveCount(2);
  await expect(page.locator(".current-blocks")).toHaveText(JSON.stringify([]));
});

test("return floating blocks", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [mockBlock] } });
  });
  await page.goto(`/js/block/block.html`);
  await expect(page.getByText("Floating blocks changed")).toHaveCount(2);
  await expect(page.locator(".current-blocks")).toHaveText(
    JSON.stringify([
      {
        id: mockBlock.id,
        type: "component",
        component: "Modal",
        props: {},
      },
    ]),
  );
});
