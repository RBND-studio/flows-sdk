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

const getBlock = (): Block => ({
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
        url: "/another-page",
      },
    },
  ],
});

test("react link component navigation", async ({ page }) => {
  await mockBlocksEndpoint(page, [getBlock()]);
  await page.goto(`/react.html?LinkComponent=true`);
  await expect(page.getByText("My modal", { exact: true })).toBeVisible();
  await page.getByText("Go to another page", { exact: true }).click();
  // The example app uses HashRouter
  expect(page).toHaveURL(`/react.html?LinkComponent=true#/another-page`);
});
