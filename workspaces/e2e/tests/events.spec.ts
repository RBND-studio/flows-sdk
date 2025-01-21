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
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "", continueText: "continue" },
  exitNodes: [],
  slottable: false,
};

const run = (packageName: string) => {
  test(`${packageName} - shouldn't pass any methods without exit nodes`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block")).toBeVisible();
    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url().includes("v2/sdk/events")) {
        reqWasSent = true;
      }
    });
    await page.getByText("continue").click();
    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - should pass methods with exit nodes`, async ({ page }) => {
    const b: Block = {
      ...block,
      exitNodes: ["continue"],
    };
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [b] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block")).toBeVisible();
    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.propertyKey === "continue"
      );
    });
    await page.getByText("continue").click();
    await req;
  });
};

run("js");
run("react");
