import { Block } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({ showCloseButton }: { showCloseButton?: boolean }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Hint",
  data: {
    title: "Hint title",
    body: "Hint body",
    continueText: "continue",
    targetElement: "h1",
    showCloseButton,
  },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: [],
});

const getTourBlock = ({ showCloseButton }: { showCloseButton?: boolean }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  tourBlocks: [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "Hint",
      data: {
        title: "Hint title",
        body: "Hint body",
        continueText: "continue",
        previousText: "previous",
        targetElement: "h1",
        showCloseButton,
      },
      slottable: false,
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should render workflow hint`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({})] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_hint_hotspot")).toBeVisible();
    await expect(page.locator(".flows_hint_tooltip")).toBeHidden();
    await page.locator(".flows_hint_hotspot").click();
    await expect(page.locator(".flows_hint_tooltip")).toBeVisible();
    await expect(page.getByText("Hint title", { exact: true })).toBeVisible();
    await expect(page.getByText("Hint body", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_close")).toBeHidden();
    await page.getByText("continue", { exact: true }).click();
    await expect(page.getByText("Hint title", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should render tour hint`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTourBlock({})] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_hint_hotspot")).toBeVisible();
    await expect(page.locator(".flows_hint_tooltip")).toBeHidden();
    await page.locator(".flows_hint_hotspot").click();
    await expect(page.locator(".flows_hint_tooltip")).toBeVisible();
    await expect(page.getByText("Hint title", { exact: true })).toBeVisible();
    await expect(page.getByText("Hint body", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_close")).toBeHidden();
    await page.getByText("continue", { exact: true }).click();
    await expect(page.getByText("Hint title", { exact: true })).toBeHidden();
  });
};

run("js");
run("react");
