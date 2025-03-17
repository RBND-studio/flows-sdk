import { Block } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

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
  data: { title: "Tooltip title", body: "", continueText: "continue", targetElement },
  exitNodes: ["continue"],
  slottable: false,
  specialProperties: [],
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
  });
};

run("js");
run("react");
