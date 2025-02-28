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
  type,
  continueText,
}: {
  type: "Modal" | "Tooltip";
  continueText?: string;
}): Block => ({
  id: randomUUID(),
  data: { title: `Workflow ${type}`, body: "", continueText, targetElement: "h1" },
  type: "component",
  componentType: type,
  exitNodes: ["continue"],
  slottable: false,
});

const getTourBlock = ({
  type,
  continueText,
}: {
  type: "Modal" | "Tooltip";
  continueText?: string;
}): Block => ({
  id: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: [],
  slottable: false,

  tourBlocks: [
    {
      id: randomUUID(),
      data: { title: `Workflow ${type}`, body: "", continueText, targetElement: "h1" },
      type: "tour-component",
      componentType: type,
      slottable: false,
    },
  ],
});

const run = (packageName: string) => {
  // Workflow blocks
  test(`${packageName} - workflow tooltip footer with buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getBlock({ type: "Tooltip", continueText: "Continue" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Tooltip", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_footer")).toBeVisible();
    await expect(
      page.locator(".flows_tooltip_footer").locator(".flows_button_primary"),
    ).toBeVisible();
  });
  test(`${packageName} - workflow tooltip no footer without buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getBlock({ type: "Tooltip", continueText: "" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Tooltip", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_footer")).toHaveCount(0);
  });
  test(`${packageName} - workflow modal footer with buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getBlock({ type: "Modal", continueText: "Continue" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Modal", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_footer")).toBeVisible();
    await expect(
      page.locator(".flows_modal_footer").locator(".flows_button_primary"),
    ).toBeVisible();
  });
  test(`${packageName} - workflow modal no footer without buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getBlock({ type: "Modal", continueText: "" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Modal", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_footer")).toHaveCount(0);
  });

  // Tour blocks
  test(`${packageName} - tour tooltip footer with buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getTourBlock({ type: "Tooltip", continueText: "Continue" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Tooltip", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_footer")).toBeVisible();
    await expect(
      page.locator(".flows_tooltip_footer").locator(".flows_button_primary"),
    ).toBeVisible();
  });
  test(`${packageName} - tour tooltip no footer without buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getTourBlock({ type: "Tooltip", continueText: "" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Tooltip", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_tooltip_footer")).toHaveCount(0);
  });
  test(`${packageName} - tour modal footer with buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getTourBlock({ type: "Modal", continueText: "Continue" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Modal", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_footer")).toBeVisible();
    await expect(
      page.locator(".flows_modal_footer").locator(".flows_button_primary"),
    ).toBeVisible();
  });
  test(`${packageName} - tour modal no footer without buttons`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: { blocks: [getTourBlock({ type: "Modal", continueText: "" })] },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow Modal", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_modal_footer")).toHaveCount(0);
  });
};

run("js");
run("react");
