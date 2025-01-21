import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getTourWithWait = (): Block => ({
  id: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: [
    {
      id: randomUUID(),
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
      type: "wait",
      slottable: false,
      data: {},
      tourWait: {
        interaction: "click",
        element: "h1",
        page: {
          operator: "contains",
          value: ["?correct=true"],
        },
      },
    },
    {
      id: randomUUID(),
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
});

const getTourWithModalWait = (): Block => ({
  id: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: [
    {
      id: randomUUID(),
      type: "tour-component",
      componentType: "Modal",
      data: {
        title: "Hello",
        body: "",
        showCloseButton: true,
        hideOverlay: true,
      },
      tourWait: {
        interaction: "click",
        element: "h1",
        page: {
          operator: "contains",
          value: ["?correct=true"],
        },
      },
      slottable: false,
    },
    {
      id: randomUUID(),
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
});

const run = (packageName: string) => {
  test(`${packageName} - should wait for next step`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithWait()] } });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await page.getByText("Continue").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeVisible();
  });
  test(`${packageName} - should not trigger wait on incorrect page`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithWait()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await page.getByText("Continue").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeHidden();
  });
  test(`${packageName} - should not trigger wait by clicking on incorrect element`, async ({
    page,
  }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithWait()] } });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await page.getByText("Continue").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeHidden();
    await page.locator("h2").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeHidden();
  });

  test(`${packageName} - should wait for modal wait`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithModalWait()] } });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await expect(page.getByText("Continue")).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello")).toBeHidden();
    await expect(page.getByText("World")).toBeVisible();
  });
  test(`${packageName} - should not trigger modal wait on incorrect page`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithModalWait()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await expect(page.getByText("Continue")).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
  });
  test(`${packageName} - should not trigger modal wait by clicking on incorrect element`, async ({
    page,
  }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourWithModalWait()] } });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
    await expect(page.getByText("Continue")).toBeHidden();
    await page.locator("h2").click();
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("World")).toBeHidden();
  });
};

run("js");
run("react");
