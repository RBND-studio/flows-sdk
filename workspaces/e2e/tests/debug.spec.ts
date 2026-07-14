import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import { randomUUID } from "node:crypto";

const organizationId = randomUUID();

const run = (packageName: string) => {
  test(`${packageName} - should show debug panel`, async ({ page }) => {
    await mockBlocksEndpoint(page, []);

    await page.goto(`/${packageName}.html?organizationId=${organizationId}`);

    await expect(page.locator(".flows-debug-menu")).toBeVisible();
    await page.locator(".flows-debug-menu").click();

    await expect(page.locator(".flows-debug-popover")).toBeVisible();

    const firstItem = page.locator(".flows-debug-item").nth(0);
    await expect(firstItem).toContainText("User");
    await expect(firstItem).toContainText("testUserId");
    await firstItem.click();

    await expect(page.getByText("User Information", { exact: true })).toBeVisible();
    await expect(page.getByText("testUserId", { exact: true })).toBeVisible();
    await expect(page.getByText("test@flows.sh")).toBeVisible();
    await page.getByLabel("Go back", { exact: true }).click();

    const secondItem = page.locator(".flows-debug-item").nth(1);
    await expect(secondItem).toContainText("SDK setup");
    await expect(secondItem).toContainText("Valid");
    await secondItem.click();

    await expect(page.getByText("SDK Setup", { exact: true })).toBeVisible();
    await expect(page.getByText(organizationId, { exact: true })).toBeVisible();
    await expect(page.getByText("prod", { exact: true })).toBeVisible();
    await expect(page.getByText("Organization ID is valid.", { exact: true })).toBeVisible();
    await expect(page.getByText("User ID is set.", { exact: true })).toBeVisible();
    await expect(page.getByText("Environment is set.", { exact: true })).toBeVisible();
    await expect(page.getByText("API responded successfully.", { exact: true })).toBeVisible();
    await page.getByLabel("Go back", { exact: true }).click();

    const thirdItem = page.locator(".flows-debug-item").nth(2);
    await expect(thirdItem).toContainText("Blocks");
    await expect(thirdItem).toContainText("0 loaded");
    await thirdItem.click();

    await expect(page.getByText("Blocks", { exact: true })).toBeVisible();
    await expect(page.getByText("Loaded blocks: 0", { exact: true })).toBeVisible();
    await expect(page.getByText("Blocks JSON:", { exact: true })).toBeVisible();
    await expect(page.locator(".flows-debug-code-block")).toContainText("[]");
    await page.getByLabel("Go back", { exact: true }).click();

    const fourthItem = page.locator(".flows-debug-item").nth(3);
    const currentUrl = `/${packageName}.html?organizationId=${organizationId}`;
    await expect(fourthItem).toContainText("Pathname");
    await expect(fourthItem).toContainText(currentUrl);
    await fourthItem.click();

    await expect(page.getByText("Pathname", { exact: true })).toBeVisible();
    await expect(page.getByText(currentUrl, { exact: true })).toBeVisible();
    await expect(
      page.getByText("This pathname is used when evaluating page targeting conditions.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByLabel("Go back", { exact: true }).click();

    const settingsItem = page.locator(".flows-debug-item").nth(4);

    await expect(settingsItem).toContainText("Settings");
    await expect(settingsItem).toContainText(/@flows\/(js|react)@\d+\.\d+\.\d+/);
    await settingsItem.click();

    await expect(page.locator(".flows-debug-bottom-right")).toBeVisible();
    await expect(page.locator(".flows-debug-top-left")).toBeHidden();
    await page.locator("#debug-panel-position").selectOption("top-left");
    await expect(page.locator(".flows-debug-top-left")).toBeVisible();
    await expect(page.locator(".flows-debug-bottom-right")).toBeHidden();
    const shortcutList = page.locator(".flows-debug-shortcut-list");

    await expect(shortcutList).toContainText(/(Ctrl|Cmd)/);
    await expect(shortcutList).toContainText(/(Alt|Option)/);
    await expect(shortcutList).toContainText("Shift");
    await expect(shortcutList).toContainText("F");
    await expect(page.getByText("Open docs")).toHaveAttribute(
      "href",
      "https://flows.sh/docs/sdk-overview#debug-mode",
    );
    await expect(page.getByText("SDK version", { exact: true })).toBeVisible();
    await expect(page.getByText(/@flows\/(js|react)@\d+\.\d+\.\d+/, { exact: true })).toBeVisible();
    await page.getByLabel("Go back", { exact: true }).click();

    await expect(page.getByText("Open Flows dashboard", { exact: true })).toHaveAttribute(
      "href",
      `https://app.flows.sh/org/${organizationId}`,
    );
  });
};

run("js");
run("react");
