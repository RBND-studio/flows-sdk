import { Block, BlockUpdatesPayload } from "@flows/shared";
import { expect, Route, test, WebSocketRoute } from "@playwright/test";
import { randomUUID } from "crypto";

let ws: WebSocketRoute | null = null;
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    (_ws) => {
      ws = _ws;
    },
  );
});

const getBlock = (): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: { title: "Hello world", body: "" },
  exitNodes: [],
  slottable: false,
  propertyMeta: [],
});

const run = (packageName: string) => {
  test(`${packageName} - should call blocks with correct parameters`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.userProperties.email === "test@flows.sh" &&
        body.userProperties.age === 10 &&
        body.language === undefined
      );
    });
    await page.goto(`/${packageName}.html`);
    await blocksReq;
  });
  test(`${packageName} - should call custom apiUrl`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://custom.api.flows.com/v2/sdk/blocks" &&
        (headers["x-flows-version"] ?? "").startsWith("@flows/") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.userProperties.email === "test@flows.sh" &&
        body.userProperties.age === 10 &&
        body.language === undefined
      );
    });
    const urlParams = new URLSearchParams();
    urlParams.set("apiUrl", "https://custom.api.flows.com");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
  test(`${packageName} - should apply update messages after /blocks is received`, async ({
    page,
  }) => {
    let blocksRoute: Route | null = null;
    await page.route("**/v2/sdk/blocks", (route) => {
      blocksRoute = route;
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toHaveText(JSON.stringify([]));
    const block = getBlock();
    const payload: BlockUpdatesPayload = {
      exitedBlockIds: [],
      updatedBlocks: [block],
    };
    ws?.send(JSON.stringify(payload));
    await expect(page.getByText("Hello world", { exact: true })).toBeHidden();
    (blocksRoute as Route | null)?.fulfill({ json: { blocks: [] } });
    await expect(page.getByText("Hello world", { exact: true })).toBeVisible();
  });
};

run("js");
run("react");
