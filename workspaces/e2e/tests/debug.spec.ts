import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";

const organizationId = "480760cf-706e-43cf-a257-969f7d2623ac";

const run = (packageName: string) => {
  test(`${packageName} - should show debug panel`, async ({ page, context }) => {
    mockBlocksEndpoint(page, []);

    await page.goto(`/${packageName}.html?organizationId=${organizationId}`);

    await expect(page.locator(".flows-debug-menu")).toBeVisible();
    await page.locator(".flows-debug-menu").click();

    await expect(page.locator(".flows-debug-popover")).toBeVisible();
    await expect(page).toHaveScreenshot(`${packageName}-home.png`);

    expect(await page.locator("a.flows-debug-item").getAttribute("href")).toEqual(
      `https://app.flows.sh/org/${organizationId}`,
    );

    await page.getByText("User", { exact: true }).click();
    await expect(page).toHaveScreenshot(`${packageName}-user.png`);

    await page.locator(".flows-debug-section-close").click();
    await page.getByText("SDK setup", { exact: true }).click();
    await expect(page).toHaveScreenshot(`${packageName}-sdk-setup.png`);

    await page.locator(".flows-debug-section-close").click();
    await page.getByText("Blocks", { exact: true }).click();
    await expect(page).toHaveScreenshot(`${packageName}-blocks.png`);

    await page.locator(".flows-debug-section-close").click();
    await page.getByText("Pathname", { exact: true }).click();
    await expect(page).toHaveScreenshot(`${packageName}-pathname.png`);

    await page.locator(".flows-debug-section-close").click();
    await page.getByText("Settings", { exact: true }).click();
    await expect(page).toHaveScreenshot(`${packageName}-settings.png`);
  });
};

run("js");
run("react");
