import { Block } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

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
  data: { title: "Modal title", body: "", continueText: "continue", hideOverlay, showCloseButton },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: [],
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
};

run("js");
run("react");
