import { Block } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const block: Block = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "", continueText: "continue" },
  exitNodes: [],
  slottable: false,
  propertyMeta: [],
};

const run = (packageName: string) => {
  test(`${packageName} - shouldn't pass any methods without exit nodes`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url() === "https://api.flows-cloud.com/v2/sdk/events") {
        reqWasSent = true;
      }
    });
    await page.getByText("continue", { exact: true }).click();
    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - should pass methods with exit nodes and hide the block`, async ({
    page,
  }) => {
    const b: Block = {
      ...block,
      exitNodes: ["continue"],
    };
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [b] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.propertyKey === "continue"
      );
    });
    await page.getByText("continue", { exact: true }).click();
    await req;
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden({ timeout: 0 });
  });
};

run("js");
run("react");
