import { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = (props: { key: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Card",
  data: { text: "My card" },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
  key: props.key,
  propertyMeta: [],
});

const run = (packageName: string) => {
  test(`${packageName} - should pass block key to component props`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({ key: "my-block-key" })] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("key: my-block-key", { exact: true })).toBeVisible();
  });
};

run("js");
run("react");
