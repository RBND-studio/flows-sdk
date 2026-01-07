import { Block, PropertyMeta, TourStep } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { getTour, mockBlocksEndpoint } from "../utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({
  targetElement,
  propertyMeta,
}: {
  targetElement: string;
  propertyMeta?: PropertyMeta[];
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Tooltip",
  data: {
    title: "Tooltip title",
    body: "Tooltip body",
    targetElement,
    dismissible: true,
  },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: propertyMeta ?? [],
});

const getTourStep = ({
  title,
  propertyMeta,
  hideProgress,
}: {
  title: string;
  propertyMeta?: PropertyMeta[];
  hideProgress?: boolean;
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "BasicsV2Tooltip",
  data: {
    title,
    body: "Tooltip body",
    targetElement: "h1",
    dismissible: true,
    hideProgress: hideProgress ?? false,
  },
  propertyMeta: propertyMeta ?? [
    {
      type: "action",
      key: "primaryButton",
      value: { label: "Continue", exitNode: "continue" },
    },
    {
      type: "action",
      key: "secondaryButton",
      value: { label: "Previous", exitNode: "previous" },
    },
  ],
  slottable: false,
});

const run = (packageName: string) => {
  test.describe("workflow", () => {
    test(`${packageName} - shouldn't render without target element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getBlock({ targetElement: "" })]);
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
      await mockBlocksEndpoint(page, [getBlock({ targetElement: "#invalid-element" })]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Tooltip title", { exact: true })).toBeHidden();
    });
    test(`${packageName} - should render with target element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          targetElement: "h1",
          propertyMeta: [
            {
              key: "primaryButton",
              type: "action",
              value: { label: "Continue", exitNode: "continue" },
            },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Tooltip title", { exact: true })).toBeVisible();
      const overlayEl = page.locator(".flows_basicsV2_tooltip_overlay");
      await expect(overlayEl).toBeVisible();
      expect(overlayEl).not.toHaveCSS("width", "0px");
      expect(overlayEl).not.toHaveCSS("height", "0px");

      await expect(page.locator(".flows_basicsV2_tooltip_root")).toMatchAriaSnapshot(`
      - paragraph: Tooltip title
      - paragraph: Tooltip body
      - button "Continue"
      - button "Close":
        - img
      `);
    });

    test(`${packageName} - shouldn't render tooltip footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getBlock({ targetElement: "h1" })]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Tooltip title", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_tooltip_footer")).toHaveCount(0);
    });
    test(`${packageName} - should render tooltip with both buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          targetElement: "h1",
          propertyMeta: [
            {
              key: "primaryButton",
              type: "action",
              value: { label: "Continue", exitNode: "continue" },
            },
            {
              key: "secondaryButton",
              type: "action",
              value: { label: "Cancel", exitNode: "close" },
            },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Tooltip title", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_tooltip_root")).toMatchAriaSnapshot(`
      - paragraph: Tooltip title
      - paragraph: Tooltip body
      - button "Cancel"
      - button "Continue"
      - button "Close":
        - img
      `);
      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_tooltip_tooltip")).toBeHidden();
    });
  });

  test.describe("tour", () => {
    test(`${packageName} - should render tooltip`, async ({ page }) => {
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

      await expect(page.locator(".flows_basicsV2_tooltip_tooltip")).toBeVisible();
      await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
      await expect(page.getByText("Step 2", { exact: true })).toBeHidden();
      await expect(page.locator(".flows_basicsV2_dots")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_dots_dot")).toHaveCount(2);
      await expect(page.locator(".flows_basicsV2_dots_dot_active")).toHaveCount(1);
      const overlayEl = page.locator(".flows_basicsV2_tooltip_overlay");
      await expect(overlayEl).toBeVisible();
      expect(overlayEl).not.toHaveCSS("width", "0px");
      expect(overlayEl).not.toHaveCSS("height", "0px");

      await expect(page.locator(".flows_basicsV2_tooltip_root")).toMatchAriaSnapshot(`
        - paragraph: Step 1
        - paragraph: Tooltip body
        - button "Previous"
        - button "Continue"
        - button "Close":
          - img
        `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.getByText("Step 1", { exact: true })).toBeHidden();
      await expect(page.getByText("Step 2", { exact: true })).toBeVisible();

      await expect(page.locator(".flows_basicsV2_tooltip_root")).toMatchAriaSnapshot(`
          - paragraph: Step 2
          - paragraph: Tooltip body
          - button "Previous"
          - button "Continue"
          - button "Close":
            - img
          `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_tooltip_tooltip")).toBeHidden();
    });

    test(`${packageName} - shouldn't render tooltip footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({ title: "Tooltip title", propertyMeta: [], hideProgress: true }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Tooltip title", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_tooltip_footer")).toHaveCount(0);
    });
  });
};

run("js");
run("react");
