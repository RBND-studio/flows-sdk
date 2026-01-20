import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import { Block } from "@flows/shared";
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

test.describe("react", () => {
  test("link component navigation", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page" })]);
    await page.goto(`/react.html?LinkComponent=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    // The example app uses HashRouter
    await expect(page).toHaveURL(`/react.html?LinkComponent=true#/another-page`);
  });
  test("should use link with relative urls", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "?search=test" })]);
    await page.goto(`/react.html?LinkComponent=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`/react.html?LinkComponent=true#/?search=test`);
  });
  test("should support personalization", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/{{ email }}" })]);
    await page.goto(`/react.html?LinkComponent=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to another page" })).toHaveAttribute(
      "href",
      "#/test@flows.sh",
    );
  });
  test("should fallback to <a> without link component", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page" })]);
    await page.goto(`/react.html`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`/another-page`);
  });
  test("shouldn't use link component with target blank", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "/another-page", openInNew: true })]);
    await page.goto(`/react.html?LinkComponent=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    const newTabPromise = page.waitForEvent("popup");
    await expect(page).toHaveURL(`/react.html?LinkComponent=true`);
    const newTab = await newTabPromise;
    await expect(newTab).toHaveURL("/another-page");
  });
  test("shouldn't use link component for external links", async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ url: "https://example.com" })]);
    await page.goto(`/react.html?LinkComponent=true`);
    await expect(page.getByText("My modal", { exact: true })).toBeVisible();
    await page.getByText("Go to another page", { exact: true }).click();
    await expect(page).toHaveURL(`https://example.com`);
  });
});
