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

const getBlock = ({ targetElement }: { targetElement: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Tooltip",
  data: {
    title: "Tooltip title",
    body: "Tooltip body",
    continueText: "continue",
    targetElement,
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
  componentType: "Tooltip",
  data: {
    title,
    body: "Tooltip body",
    targetElement: "h1",
    continueText: "Continue",
    previousText: "Previous",
    showCloseButton: true,
  },
  slottable: false,
});

const run = (packageName: string) => {
  test(`${packageName} - shouldn't render without target element`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({ targetElement: "" })] } });
    });
    let querySelectorError = false;
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("Failed to execute 'querySelector'")) {
        querySelectorError = true;
      }
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tooltip title", { exact: true })).toBeHidden();
    // Check the React rendered H1 is still present
    await expect(page.locator("h1")).toBeVisible();
    expect(querySelectorError).toBe(false);
  });
  test(`${packageName} - shouldn't render without reference element`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({ targetElement: "#invalid-element" })] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tooltip title", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should render with target element`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({ targetElement: "h1" })] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tooltip title", { exact: true })).toBeVisible();

    await expect(page.locator(".flows_tooltip_root")).toMatchAriaSnapshot(`
      - paragraph: Tooltip title
      - paragraph: Tooltip body
      - button "continue"
      - button "Close":
        - img
    `);
  });

  test(`${packageName} - should render tour tooltip`, async ({ page }) => {
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

    await expect(page.locator(".flows_tooltip_tooltip")).toBeVisible();
    await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Step 2", { exact: true })).toBeHidden();

    await expect(page.locator(".flows_tooltip_root")).toMatchAriaSnapshot(`
      - paragraph: Step 1
      - paragraph: Tooltip body
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 1", { exact: true })).toBeHidden();
    await expect(page.getByText("Step 2", { exact: true })).toBeVisible();

    await expect(page.locator(".flows_tooltip_root")).toMatchAriaSnapshot(`
      - paragraph: Step 2
      - paragraph: Tooltip body
      - button "Previous"
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.locator(".flows_tooltip_tooltip")).toBeHidden();
  });
};

run("js");
run("react");
