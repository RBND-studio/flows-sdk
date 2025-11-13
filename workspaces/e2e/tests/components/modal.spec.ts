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
  hideOverlay,
  dismissible,
  propertyMeta,
}: {
  hideOverlay?: boolean;
  dismissible?: boolean;
  propertyMeta?: PropertyMeta[];
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: {
    title: "Modal title",
    body: "Modal body",
    hideOverlay,
    dismissible,
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
  componentType: "BasicsV2Modal",
  data: {
    title,
    body: "Modal body",
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
    test(`${packageName} - should render overlay by default and no close button`, async ({
      page,
    }) => {
      await mockBlocksEndpoint(page, [getBlock({})]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_modal_overlay")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_modal_close")).toBeHidden();

      await expect(page.locator(".flows_basicsV2_modal_wrapper")).toMatchAriaSnapshot(`
        - paragraph: Modal title
        - paragraph: Modal body
        `);
    });
    test(`${packageName} - should render overlay and close button by props`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          hideOverlay: true,
          dismissible: true,
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
      await expect(page.locator(".flows_basicsV2_modal_wrapper")).toMatchAriaSnapshot(`
        - paragraph: Modal title
        - paragraph: Modal body
        - button "Cancel"
        - button "Continue"
        - button "Close":
          - img
        `);
      await expect(page.getByText("Modal title", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_modal_overlay")).toBeHidden();
      await expect(page.locator(".flows_basicsV2_modal_close")).toBeVisible();
      await page.locator(".flows_basicsV2_modal_close").click();
      await expect(page.getByText("Modal title", { exact: true })).toBeHidden();
    });
    test(`${packageName} - shouldn't render modal footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getBlock({})]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_modal_footer")).toBeHidden();
    });
  });

  test.describe("tour", () => {
    test(`${packageName} - should render tour modal`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [getTourStep({ title: "Step 1" }), getTourStep({ title: "Step 2" })],
        }),
      ]);
      await page.goto(`/${packageName}.html`);

      await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
      await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
      await expect(page.getByText("Step 2", { exact: true })).toBeHidden();
      await expect(page.locator(".flows_basicsV2_dots")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_dots_dot")).toHaveCount(2);
      await expect(page.locator(".flows_basicsV2_dots_dot_active")).toHaveCount(1);

      await expect(page.locator(".flows_basicsV2_modal_wrapper")).toMatchAriaSnapshot(`
        - paragraph: Step 1
        - paragraph: Modal body
        - button "Previous"
        - button "Continue"
        - button "Close":
          - img
        `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.getByText("Step 1", { exact: true })).toBeHidden();
      await expect(page.getByText("Step 2", { exact: true })).toBeVisible();

      await expect(page.locator(".flows_basicsV2_modal_wrapper")).toMatchAriaSnapshot(`
          - paragraph: Step 2
          - paragraph: Modal body
          - button "Previous"
          - button "Continue"
          - button "Close":
            - img
          `);

      await page.getByText("Continue", { exact: true }).click();
      await expect(page.locator(".flows_basicsV2_modal_modal")).toBeHidden();
    });
    test(`${packageName} - should hide footer without buttons`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [getTourStep({ title: "Modal title", propertyMeta: [], hideProgress: true })],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
      await expect(page.locator(".flows_basicsV2_modal_footer")).toHaveCount(0);
    });
  });
};

run("js");
run("react");
