import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "../utils";
import type { Block } from "@flows/shared";
import { randomUUID } from "crypto";

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
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: "BasicsV2" })]);
    await page.goto(`http://127.0.0.1:3000/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: undefined })]);
    await page.goto(`http://127.0.0.1:3000/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeHidden();
  });
  test(`${packageName} - custom component should be visible on localhost`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: "BasicsV2" })]);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
    await mockBlocksEndpoint(page, [getBlock({ componentLibraryName: undefined })]);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_modal_modal")).toBeVisible();
  });
};

run("js");
run("react");
