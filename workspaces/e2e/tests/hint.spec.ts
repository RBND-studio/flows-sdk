import { Block, TourStep } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { getTour } from "./utils";

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
  componentType: "Hint",
  data: {
    title: "Hint title",
    body: "Hint body",
    continueText: "continue",
    targetElement: "h1",
    showCloseButton: true,
  },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: [],
});

const getTourStep = ({ title }: { title: string }): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "Hint",
  data: {
    title,
    body: "Hint body",
    continueText: "Continue",
    previousText: "Previous",
    targetElement: "h1",
    showCloseButton: true,
  },
  slottable: false,
});

const run = (packageName: string) => {
  test(`${packageName} - should render workflow hint`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock()] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_hint_hotspot")).toBeVisible();
    await expect(page.locator(".flows_hint_tooltip")).toBeHidden();
    await page.locator(".flows_hint_hotspot").click();

    await expect(page.locator(".flows_hint_hotspot")).toMatchAriaSnapshot(`- button "Open hint"`);
    await expect(page.locator(".flows_hint_tooltip")).toMatchAriaSnapshot(`
      - paragraph: Hint title
      - paragraph: Hint body
      - button "continue"
      - button "Close":
        - img
    `);

    await expect(page.locator(".flows_hint_tooltip")).toBeVisible();
    await expect(page.getByText("Hint title", { exact: true })).toBeVisible();
    await expect(page.getByText("Hint body", { exact: true })).toBeVisible();
    await page.getByText("continue", { exact: true }).click();
    await expect(page.getByText("Hint title", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should render tour hint`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour({
              tourBlocks: [getTourStep({ title: "Step 1" }), getTourStep({ title: "Step 2" })],
            }),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_hint_hotspot")).toBeVisible();
    await expect(page.locator(".flows_hint_tooltip")).toBeHidden();
    await page.locator(".flows_hint_hotspot").click();

    await expect(page.locator(".flows_hint_tooltip")).toMatchAriaSnapshot(`
      - paragraph: Step 1
      - paragraph: Hint body
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.locator(".flows_hint_hotspot")).toBeVisible();
    await expect(page.locator(".flows_hint_tooltip")).toBeHidden();
    await page.locator(".flows_hint_hotspot").click();

    await expect(page.locator(".flows_hint_tooltip")).toMatchAriaSnapshot(`
      - paragraph: Step 2
      - paragraph: Hint body
      - button "Previous"
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hint title", { exact: true })).toBeHidden();
  });
};

run("js");
run("react");
