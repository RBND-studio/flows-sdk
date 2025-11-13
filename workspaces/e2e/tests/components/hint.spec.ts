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

const getBlock = ({ propertyMeta }: { propertyMeta?: PropertyMeta[] }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Hint",
  data: {
    title: "Hint title",
    body: "Hint body",
    targetElement: "h1",
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
  componentType: "BasicsV2Hint",
  data: {
    title,
    body: "Hint body",
    targetElement: "h1",
    dismissible: true,
    hideProgress: hideProgress ?? false,
  },
  slottable: false,
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
});

const run = (packageName: string) => {
  test.describe("workflow", () => {
    test(`${packageName} - should render workflow hint`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
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
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await page.locator(".flows_basicsV2_hint_hotspot").click();

      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toMatchAriaSnapshot(
        `- button "Open hint"`,
      );
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toMatchAriaSnapshot(`
      - paragraph: Hint title
      - paragraph: Hint body
      - button "Cancel"
      - button "Continue"
      - button "Close":
        - img
      `);

      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeVisible();
      await expect(page.getByText("Hint title", { exact: true })).toBeVisible();
      await expect(page.getByText("Hint body", { exact: true })).toBeVisible();
      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeHidden();
    });
    test(`${packageName} - should hide footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getBlock({})]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await page.locator(".flows_basicsV2_hint_hotspot").click();
      await expect(page.locator(".flows_basicsV2_tooltip_footer")).toBeHidden();
    });
  });

  test.describe("tour", () => {
    test(`${packageName} - should render tour hint`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [getTourStep({ title: "Step 1" }), getTourStep({ title: "Step 2" })],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await page.locator(".flows_basicsV2_hint_hotspot").click();
      await expect(page.locator(".flows_basicsV2_dots")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_dots_dot")).toHaveCount(2);
      await expect(page.locator(".flows_basicsV2_dots_dot_active")).toHaveCount(1);

      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toMatchAriaSnapshot(`
        - paragraph: Step 1
        - paragraph: Hint body
        - button "Continue"
        - button "Close":
          - img
        `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await page.locator(".flows_basicsV2_hint_hotspot").click();

      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toMatchAriaSnapshot(`
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
    test(`${packageName} - should hide footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [getTourStep({ title: "Hint title", propertyMeta: [], hideProgress: true })],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_hint_hotspot")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_hint_tooltip")).toBeHidden();
      await page.locator(".flows_basicsV2_hint_hotspot").click();
      await expect(page.locator(".flows_basicsV2_tooltip_footer")).toBeHidden();
    });
  });
};

run("js");
run("react");
