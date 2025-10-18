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

const getBlock = ({
  hideOverlay,
  showCloseButton,
}: {
  hideOverlay?: boolean;
  showCloseButton?: boolean;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: {
    title: "Modal title",
    body: "Modal body",
    continueText: "continue",
    hideOverlay,
    showCloseButton,
  },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: [],
});

const getTourStep = ({ title }: { title: string }): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "Modal",
  data: {
    title,
    body: "Modal body",
    continueText: "Continue",
    previousText: "Previous",
    showCloseButton: true,
  },
  slottable: false,
});

const run = (packageName: string) => {
  test(`${packageName} - should render overlay by default and no close button`, async ({
    page,
  }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({})] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Modal title", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_overlay")).toBeVisible();
    await expect(page.locator(".flows_modal_close")).toBeHidden();

    await expect(page.locator(".flows_modal_wrapper")).toMatchAriaSnapshot(`
      - paragraph: Modal title
      - paragraph: Modal body
      - button "continue"
`);

    await page.getByText("continue", { exact: true }).click();
    await expect(page.getByText("Modal title", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should render overlay and close button by props`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getBlock({ hideOverlay: true, showCloseButton: true })] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Modal title", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_overlay")).toBeHidden();
    await expect(page.locator(".flows_modal_close")).toBeVisible();
    await page.locator(".flows_modal_close").click();
    await expect(page.getByText("Modal title", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should render tour modal`, async ({ page }) => {
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

    await expect(page.locator(".flows_modal_modal")).toBeVisible();
    await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Step 2", { exact: true })).toBeHidden();

    await expect(page.locator(".flows_modal_wrapper")).toMatchAriaSnapshot(`
      - paragraph: Step 1
      - paragraph: Modal body
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 1", { exact: true })).toBeHidden();
    await expect(page.getByText("Step 2", { exact: true })).toBeVisible();

    await expect(page.locator(".flows_modal_wrapper")).toMatchAriaSnapshot(`
      - paragraph: Step 2
      - paragraph: Modal body
      - button "Previous"
      - button "Continue"
      - button "Close":
        - img
    `);

    await page.getByText("Continue", { exact: true }).click();
    await expect(page.locator(".flows_modal_modal")).toBeHidden();
  });
};

run("js");
run("react");
