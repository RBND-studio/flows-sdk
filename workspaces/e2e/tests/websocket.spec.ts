import { Block, BlockUpdatesPayload } from "@flows/shared";
import { expect, test, WebSocketRoute } from "@playwright/test";
import { randomUUID } from "crypto";

const getBlock = (): Block => ({
  id: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: { title: "Hello world", body: "" },
  exitNodes: [],
  slottable: false,
});

let ws: WebSocketRoute | null = null;
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    (_ws) => {
      ws = _ws;
    },
  );
});

const run = (packageName: string) => {
  test(`${packageName} - should display block that is received through websocket`, async ({
    page,
  }) => {
    const block = getBlock();
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello world")).toBeHidden();
    const payload: BlockUpdatesPayload = {
      exitedBlockIds: [],
      updatedBlocks: [block],
    };
    await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
    await expect(page.getByText("Hello world")).toBeVisible();
  });
  test(`${packageName} - should exit block that is received through websocket`, async ({
    page,
  }) => {
    const block = getBlock();
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello world")).toBeVisible();
    const payload: BlockUpdatesPayload = {
      exitedBlockIds: [block.id],
      updatedBlocks: [],
    };
    await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
    await expect(page.getByText("Hello world")).toBeHidden();
  });
};

run("js");
run("react");
