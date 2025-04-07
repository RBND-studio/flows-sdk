import { Block, BlockUpdatesPayload } from "@flows/shared";
import { expect, test, WebSocketRoute } from "@playwright/test";
import { randomUUID } from "crypto";

const getBlock = (): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: { title: "Hello world", body: "" },
  exitNodes: [],
  slottable: false,
  propertyMeta: [],
});

const run = (packageName: string) => {
  test.describe(`mocked websocket`, () => {
    let ws: WebSocketRoute | null = null;
    test.beforeEach(async ({ page }) => {
      await page.routeWebSocket(
        (url) => url.pathname === "/ws/sdk/block-updates",
        (_ws) => {
          ws = _ws;
        },
      );
    });

    test(`${packageName} - should display block that is received through websocket`, async ({
      page,
    }) => {
      const block = getBlock();
      await page.route("**/v2/sdk/blocks", (route) => {
        route.fulfill({ json: { blocks: [] } });
      });
      await page.goto(`/${packageName}.html`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText("Hello world", { exact: true })).toBeHidden();
      const payload: BlockUpdatesPayload = {
        exitedBlockIds: [],
        updatedBlocks: [block],
      };
      await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
      await expect(page.getByText("Hello world", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should exit block that is received through websocket`, async ({
      page,
    }) => {
      const block = getBlock();
      await page.route("**/v2/sdk/blocks", (route) => {
        route.fulfill({ json: { blocks: [block] } });
      });
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello world", { exact: true })).toBeVisible();
      const payload: BlockUpdatesPayload = {
        exitedBlockIds: [block.id],
        updatedBlocks: [],
      };
      await (ws as unknown as WebSocketRoute).send(JSON.stringify(payload));
      await expect(page.getByText("Hello world", { exact: true })).toBeHidden();
    });
  });

  test.describe(`real websocket`, () => {
    test(`${packageName} - should disconnect from websocket if the user is usage limited`, async ({
      page,
    }) => {
      await page.route("**/v2/sdk/blocks", (route) => {
        route.fulfill({ json: { blocks: [], meta: { usage_limited: true } } });
      });
      const wsPromise = page.waitForEvent("websocket");
      await page.goto(`/${packageName}.html`);
      const websocket = await wsPromise;

      let wsWasClosed = false;
      websocket.on("close", () => {
        wsWasClosed = true;
      });
      await page.waitForRequest((req) => {
        return req.url() === "https://api.flows-cloud.com/v2/sdk/blocks";
      });

      await expect(() => expect(wsWasClosed).toBe(true)).toPass();
    });
    test(`${packageName} - should keep websocket connection alive`, async ({ page }) => {
      await page.route("**/v2/sdk/blocks", (route) => {
        route.fulfill({ json: { blocks: [] } });
      });
      const wsPromise = page.waitForEvent("websocket");
      await page.goto(`/${packageName}.html`);
      const websocket = await wsPromise;

      let wsWasClosed = false;
      websocket.on("close", () => {
        wsWasClosed = true;
      });
      await page.waitForRequest((req) => {
        return req.url() === "https://api.flows-cloud.com/v2/sdk/blocks";
      });

      await new Promise((res) => setTimeout(res, 500));

      await expect(() => expect(wsWasClosed).toBe(false)).toPass();
    });
  });
};

run("js");
run("react");
