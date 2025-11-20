import { Block, PropertyMeta, TourStep } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { getTour, mockBlocksEndpoint } from "../utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({
  dismissible,
  propertyMeta,
}: {
  dismissible?: boolean;
  propertyMeta?: PropertyMeta[];
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Card",
  slottable: true,
  slotId: "my-slot",
  data: {
    title: "Card title",
    body: "Card body",
    dismissible: dismissible ?? false,
  },
  exitNodes: ["close"],
  propertyMeta: propertyMeta ?? [],
});

const getTourStep = ({
  title,
  propertyMeta,
  hideProgress,
  dismissible,
}: {
  title: string;
  propertyMeta?: PropertyMeta[];
  hideProgress?: boolean;
  dismissible?: boolean;
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "BasicsV2Card",
  slottable: true,
  slotId: "my-slot",
  data: {
    title,
    body: "Card body",
    dismissible: dismissible ?? false,
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
});

const run = (packageName: string) => {
  test.describe("workflow", () => {
    test(`${packageName} - should render card`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          dismissible: true,
          propertyMeta: [
            {
              key: "primaryButton",
              type: "action",
              value: { label: "Example", url: "https://example.com", openInNew: true },
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
      await expect(page.locator(".flows_basicsV2_card")).toMatchAriaSnapshot(`
        - paragraph: Card title
        - paragraph: Card body
        - link "Example":
          - /url: https://example.com
        - button "Cancel"
        - button "Close":
          - img
      `);
      await page.locator(".flows_basicsV2_card_close").click();
      await expect(page.locator(".flows_basicsV2_card")).toBeHidden();
    });
    test(`${packageName} - shouldn't render footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getBlock({})]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_card")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_card_footer")).toBeHidden();
      await expect(page.locator(".flows_basicsV2_card_close")).toBeHidden();
    });
  });
  test.describe("tour", () => {
    test(`${packageName} - should render tour card`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({ title: "Step 1", dismissible: true }),
            getTourStep({ title: "Step 2", dismissible: true }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);

      await expect(page.locator(".flows_basicsV2_card")).toBeVisible();
      await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
      await expect(page.getByText("Step 2", { exact: true })).toBeHidden();
      await expect(page.locator(".flows_basicsV2_dots")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_dots_dot")).toHaveCount(2);
      await expect(page.locator(".flows_basicsV2_dots_dot_active")).toHaveCount(1);

      await expect(page.locator(".flows_basicsV2_card")).toMatchAriaSnapshot(`
        - paragraph: Step 1
        - paragraph: Card body
        - button "Previous"
        - button "Continue"
        - button "Close":
          - img
      `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.getByText("Step 1", { exact: true })).toBeHidden();
      await expect(page.getByText("Step 2", { exact: true })).toBeVisible();

      await expect(page.locator(".flows_basicsV2_card")).toMatchAriaSnapshot(`
        - paragraph: Step 2
        - paragraph: Card body
        - button "Previous"
        - button "Continue"
        - button "Close":
          - img
      `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_card")).toBeHidden();
    });
    test(`${packageName} - should hide footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Card title",
              propertyMeta: [],
              hideProgress: true,
              dismissible: false,
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_card")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_dots")).toBeHidden();
      await expect(page.locator(".flows_basicsV2_card_footer")).toBeHidden();
      await expect(page.locator(".flows_basicsV2_card_close")).toBeHidden();
    });
  });
};

run("js");
run("react");
