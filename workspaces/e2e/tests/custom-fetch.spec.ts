import { test } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import { randomUUID } from "crypto";
import type { Block } from "@flows/shared";

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
  data: { title: "Workflow block", body: "" },
  exitNodes: ["continue"],
  slottable: false,
  propertyMeta: [
    {
      type: "action",
      key: "primaryButton",
      value: { label: "Continue" },
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should add custom header with custom fetch`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock()]);
    const blocksReq = page.waitForRequest((req) => {
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" &&
        req.headers()["x-test-header"] === "my-custom-value"
      );
    });
    await page.goto(`/${packageName}.html?customFetch=true`);
    await blocksReq;
    const eventReq = page.waitForRequest((req) => {
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        req.headers()["x-test-header"] === "my-custom-value"
      );
    });
    await page.getByText("Continue", { exact: true }).click();
    await eventReq;
  });
  test(`${packageName} - custom header should not be present without custom fetch`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [getBlock()]);
    const blocksReq = page.waitForRequest((req) => {
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" &&
        req.headers()["x-test-header"] === undefined
      );
    });
    await page.goto(`/${packageName}.html?customFetch=false`);
    await blocksReq;
    const eventReq = page.waitForRequest((req) => {
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        req.headers()["x-test-header"] === undefined
      );
    });
    await page.getByText("Continue", { exact: true }).click();
    await eventReq;
  });
};

run("js");
run("react");
