import { Block, PropertyMeta } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = (actionValue: PropertyMeta["value"] & { label: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  data: {
    title: "Action Title",
  },
  propertyMeta: [
    {
      key: "action",
      type: "action",
      value: actionValue,
    },
  ],
  slottable: false,
  exitNodes: ["continue", "close"],
  type: "component",
  componentType: "Action",
});

const getTour = (actionValue: PropertyMeta["value"] & { label: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  propertyMeta: [],
  slottable: false,
  exitNodes: [],
  tourBlocks: [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "Action",
      slottable: false,
      data: {
        title: "Action Tour Title",
      },
      propertyMeta: [{ key: "action", type: "action", value: actionValue }],
    },
  ],
});

const run = (packageName: string) => {
  test.describe("workflow block", () => {
    test(`${packageName} - url`, async ({ page }) => {
      mockBlocksEndpoint(page, [
        getBlock({
          label: "Example",
          url: "https://example.com",
          openInNew: true,
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Action Title", { exact: true })).toBeVisible();
      const linkEl = page.getByText("Example", { exact: true });
      await expect(linkEl).toBeVisible();
      await expect(linkEl).toHaveAttribute("href", "https://example.com");
      await expect(linkEl).toHaveAttribute("target", "_blank");
    });
    test(`${packageName} - transition`, async ({ page }) => {
      const block = getBlock({
        label: "TransitionBtn",
        exitNode: "continue",
      });
      mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Action Title", { exact: true })).toBeVisible();
      const buttonEl = page.getByRole("button", { name: "TransitionBtn", exact: true });
      await expect(buttonEl).toBeVisible();
      const reqPromise = page.waitForRequest((req) => {
        const body = req.postDataJSON();
        return (
          req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
          body.name === "transition" &&
          body.blockId === block.id
        );
      });
      await buttonEl.click();
      await reqPromise;
    });
  });
  test.describe("tour block", () => {
    test(`${packageName} - url`, async ({ page }) => {
      mockBlocksEndpoint(page, [
        getTour({
          label: "Example",
          url: "https://example.com",
          openInNew: true,
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Action Tour Title", { exact: true })).toBeVisible();
      const linkEl = page.getByText("Example", { exact: true });
      await expect(linkEl).toBeVisible();
      await expect(linkEl).toHaveAttribute("href", "https://example.com");
      await expect(linkEl).toHaveAttribute("target", "_blank");
    });
    test(`${packageName} - transition`, async ({ page }) => {
      const block = getTour({
        label: "TransitionBtn",
        exitNode: "continue",
      });
      mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Action Tour Title", { exact: true })).toBeVisible();
      const buttonEl = page.getByRole("button", { name: "TransitionBtn", exact: true });
      const reqPromise = page.waitForRequest((req) => {
        const body = req.postDataJSON();
        return (
          req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
          body.name === "transition" &&
          body.propertyKey === "complete" &&
          body.blockId === block.id
        );
      });
      await expect(buttonEl).toBeVisible();
      await buttonEl.click();
      await reqPromise;
    });
  });
};

run("js");
run("react");
