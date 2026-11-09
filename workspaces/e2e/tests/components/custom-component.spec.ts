import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "../utils";
import type { Block } from "@flows/shared";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({ componentLibraryName }: { componentLibraryName?: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  componentLibraryName,
  type: "component",
  componentType: "BasicsV2Modal",
  data: {
    title: "Modal title",
  },
  exitNodes: ["continue", "close"],
  slottable: false,
  propertyMeta: [],
});

const run = (packageName: string) => {
  test(`${packageName} - should hide custom component outside of localhost`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: "BasicsV2" })], {
      free_org: true,
    });
    await page.goto(`http://127.0.0.1:3000/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: undefined })], {
      free_org: true,
    });
    // Wait until the blocks are loaded and filtered, otherwise toBeHidden() passes before they render
    const blockedWarning = page.waitForEvent("console", (msg) =>
      msg.text().includes("Blocked 1 custom component"),
    );
    await page.goto(`http://127.0.0.1:3000/${packageName}.html`);
    await blockedWarning;
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeHidden();
  });
  test(`${packageName} - custom component should be visible on localhost`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: "BasicsV2" })], {
      free_org: true,
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: undefined })], {
      free_org: true,
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
  });
  test(`${packageName} - should show custom component outside of localhost for paid orgs`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: undefined })], {
      free_org: false,
    });
    await page.goto(`http://127.0.0.1:3000/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
  });
};

run("js");
run("react");
