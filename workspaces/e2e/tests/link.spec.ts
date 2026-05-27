import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import type { Block } from "@flows/shared";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({ url, openInNew }: { url: string; openInNew?: boolean }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: { title: "My modal" },
  exitNodes: [],
  slottable: false,
  propertyMeta: [
    {
      key: "primaryButton",
      type: "action",
      value: {
        label: "Go to another page",
        url,
        openInNew,
      },
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} link component navigation`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page" })]);
    await page.goto(`/${packageName}.html?customNavigation=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    // The example app uses HashRouter
    await expect(page).toHaveURL(`/${packageName}.html?customNavigation=true#/another-page`);
  });
  test(`${packageName} should use link with relative urls`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "?search=test" })]);
    await page.goto(`/${packageName}.html?customNavigation=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`/${packageName}.html?customNavigation=true#/?search=test`);
  });
  test(`${packageName} should support personalization`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/{{ email }}" })]);
    await page.goto(`/${packageName}.html?customNavigation=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to another page" })).toHaveAttribute(
      "href",
      /\/test@flows\.sh/,
    );
  });
  test(`${packageName} should fallback to <a> without link component`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page" })]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`/another-page`);
  });
  test(`${packageName} shouldn't use link component with target blank`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page", openInNew: true })]);
    await page.goto(`/${packageName}.html?customNavigation=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    const newTabPromise = page.waitForEvent("popup");
    await expect(page).toHaveURL(`/${packageName}.html?customNavigation=true`);
    const newTab = await newTabPromise;
    await expect(newTab).toHaveURL("/another-page");
  });
  test(`${packageName} shouldn't use link component for external links`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "https://example.com" })]);
    await page.goto(`/${packageName}.html?customNavigation=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`https://example.com`);
  });
};

run("js");
run("react");
