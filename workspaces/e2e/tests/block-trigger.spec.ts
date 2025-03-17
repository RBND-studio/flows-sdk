import { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = (): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BlockTrigger",
  data: {
    f__exit_nodes: ["trigger"],
    title: "Block Trigger title",
    items: [
      { text: "first item", f__exit_nodes: [] },
      {
        text: "second item",
        f__exit_nodes: ["trigger"],
      },
    ],
  },
  slottable: false,
  exitNodes: [],
  specialProperties: [],
});

const run = (packageName: string) => {
  test(`${packageName} - shouldn't pass trigger with empty array`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Block Trigger title", { exact: true })).toBeVisible();
    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url().includes("v2/sdk/events")) {
        reqWasSent = true;
      }
    });
    await page.getByRole("button", { name: "first item" }).click();
    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - should pass trigger with exit nodes`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Block Trigger title", { exact: true })).toBeVisible();

    const rootBlockTriggerReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.propertyKey === "trigger"
      );
    });
    await page.getByRole("button", { name: "Trigger" }).click();
    await rootBlockTriggerReq;
    await expect(page.getByText("Block Trigger title", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should pass trigger to array item`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Block Trigger title", { exact: true })).toBeVisible();

    const arrayBlockTriggerReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.propertyKey === "items.1.trigger"
      );
    });
    await page.getByRole("button", { name: "second item" }).click();
    await arrayBlockTriggerReq;
    await expect(page.getByText("Block Trigger title", { exact: true })).toBeVisible();
  });
};

run("js");
run("react");
