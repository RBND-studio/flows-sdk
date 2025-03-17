import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const tour: Block = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  specialProperties: [],
  tourBlocks: [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "Modal",
      data: {
        title: "Hello",
        body: "",
        continueText: "Continue",
        previousText: "Previous",
        showCloseButton: true,
      },
      slottable: false,
    },
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "Modal",
      data: {
        title: "World",
        body: "",
        continueText: "Continue",
        previousText: "Previous",
        showCloseButton: false,
      },
      slottable: false,
    },
  ],
};

const run = (packageName: string) => {
  test(`${packageName} - should show tour first step without previous button`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [tour] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(page.getByText("Continue", { exact: true })).toBeVisible();
    await expect(page.getByText("Previous", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to switch between tour steps`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [tour] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeHidden();
    await expect(page.getByText("Continue", { exact: true })).toBeVisible();
    await expect(page.getByText("Previous", { exact: true })).toBeVisible();
    await page.getByText("Previous", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to close the tour`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [tour] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to complete the tour`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [tour] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should send current step event`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [tour] } });
    });
    await page.goto(`/${packageName}.html`);
    const eventReq1 = page.waitForRequest(
      (req) =>
        req.url().includes("/v2/sdk/events") &&
        req.postDataJSON().name === "tour-update" &&
        req.postDataJSON().properties.currentTourIndex === 1,
    );
    await page.getByText("Continue", { exact: true }).click();
    await eventReq1;
    const eventReq2 = page.waitForRequest(
      (req) =>
        req.url().includes("/v2/sdk/events") &&
        req.postDataJSON().name === "tour-update" &&
        req.postDataJSON().properties.currentTourIndex === 0,
    );
    await page.getByText("Previous", { exact: true }).click();
    await eventReq2;
  });
};

run("js");
run("react");
