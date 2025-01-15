import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const tourWithWait: Block = {
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
      id: "t3",
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

test("should wait for next step", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithWait] } });
  });
  await page.goto(`/js/wait/wait.html?correct=true`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await page.getByText("Continue").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeHidden();
  await page.locator("h1").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeVisible();
});
test("should not trigger wait on incorrect page", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithWait] } });
  });
  await page.goto(`/js/wait/wait.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await page.getByText("Continue").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeHidden();
  await page.locator("h1").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeHidden();
});
test("should not trigger wait by clicking on incorrect element", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithWait] } });
  });
  await page.goto(`/js/wait/wait.html?correct=true`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await page.getByText("Continue").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeHidden();
  await page.locator("h2").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeHidden();
});

const tourWithModalWait: Block = {
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

test("should wait for modal wait", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithModalWait] } });
  });
  await page.goto(`/js/wait/wait.html?correct=true`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await expect(page.getByText("Continue")).toBeHidden();
  await page.locator("h1").click();
  await expect(page.getByText("Hello")).toBeHidden();
  await expect(page.getByText("World")).toBeVisible();
});
test("should not trigger modal wait on incorrect page", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithModalWait] } });
  });
  await page.goto(`/js/wait/wait.html`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await expect(page.getByText("Continue")).toBeHidden();
  await page.locator("h1").click();
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
});
test("should not trigger modal wait by clicking on incorrect element", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [tourWithModalWait] } });
  });
  await page.goto(`/js/wait/wait.html?correct=true`);
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
  await expect(page.getByText("Continue")).toBeHidden();
  await page.locator("h2").click();
  await expect(page.getByText("Hello")).toBeVisible();
  await expect(page.getByText("World")).toBeHidden();
});
