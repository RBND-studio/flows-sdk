import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const tour: Block = {
  id: "t",
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: [
    {
      id: "t1",
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
      id: "t2",
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

test("should show tour first step without previous button", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tour] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await expect(page.getByText("Continue")).toBeVisible();
  await expect(page.getByText("Previous")).toBeHidden();
});
test("should be able to switch between tour steps", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tour] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await page.getByText("Continue").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeHidden();
  await expect(page.getByText("Continue")).toBeVisible();
  await expect(page.getByText("Previous")).toBeVisible();
  await page.getByText("Previous").click();
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
});
test("should be able to close the tour", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tour] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Hello")).toBeHidden();
});
test("should be able to complete the tour", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tour] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await page.getByText("Continue").click();
  await expect(page.getByText("World")).toBeVisible();
  await page.getByText("Continue").click();
  await expect(page.getByText("World")).toBeHidden();
});

test("should send current step event", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tour] } });
  });
  await page.goto(`/js/index.html`);
  const eventReq1 = page.waitForRequest(
    (req) =>
      req.url().includes("/v2/sdk/events") &&
      req.postDataJSON().name === "tour-update" &&
      req.postDataJSON().properties.currentTourIndex === 1,
  );
  await page.getByText("Continue").click();
  await eventReq1;
  const eventReq2 = page.waitForRequest(
    (req) =>
      req.url().includes("/v2/sdk/events") &&
      req.postDataJSON().name === "tour-update" &&
      req.postDataJSON().properties.currentTourIndex === 0,
  );
  await page.getByText("Previous").click();
  await eventReq2;
});
