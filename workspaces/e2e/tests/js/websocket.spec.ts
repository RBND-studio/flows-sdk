import { Block, BlockUpdatesPayload } from "@flows/shared";
import { expect, test, WebSocketRoute } from "@playwright/test";

const block: Block = {
  id: "w",
  type: "component",
  componentType: "Modal",
  data: { title: "Hello world", body: "" },
  exitNodes: [],
  slottable: false,
};

let ws: WebSocketRoute | null = null;
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    (_ws) => {
      ws = _ws;
    },
  );
});

test("should display block that is received through websocket", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello world")).toBeHidden();
  const payload: BlockUpdatesPayload = {
    exitedBlockIds: [],
    updatedBlocks: [block],
  };
  await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
  await expect(page.getByText("Hello world")).toBeVisible();
});
test("should exit block that is received through websocket", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello world")).toBeVisible();
  const payload: BlockUpdatesPayload = {
    exitedBlockIds: ["w"],
    updatedBlocks: [],
  };
  await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
  await expect(page.getByText("Hello world")).toBeHidden();
});
