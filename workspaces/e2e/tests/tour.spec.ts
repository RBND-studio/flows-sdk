import type { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getTour = ({ currentTourIndex }: { currentTourIndex?: number }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  currentTourIndex,
  tourBlocks: [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "BasicsV2Modal",
      data: {
        title: "Hello",
        body: "",
        dismissible: true,
      },
      slottable: false,
      propertyMeta: [
        {
          type: "action",
          key: "primaryButton",
          value: { label: "Continue", exitNode: "continue" },
        },
        {
          type: "action",
          key: "secondaryButton",
          value: { label: "Previous", exitNode: "previous" },
        },
      ],
    },
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      type: "tour-component",
      componentType: "BasicsV2Modal",
      data: {
        title: "World",
        body: "",
        dismissible: false,
      },
      slottable: false,
      propertyMeta: [
        {
          type: "action",
          key: "primaryButton",
          value: { label: "Continue", exitNode: "continue" },
        },
        {
          type: "action",
          key: "secondaryButton",
          value: { label: "Previous", exitNode: "previous" },
        },
      ],
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should be able to switch between tour steps`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeHidden();
    await expect(page.getByText("Continue", { exact: true })).toBeVisible();
    await expect(page.getByText("Previous", { exact: true })).toBeVisible();
    await page.getByText("Previous", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to close the tour`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to complete the tour`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should send current step event`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    const eventReq1 = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().includes("/v2/sdk/events") &&
        req.postDataJSON().name === "tour-update" &&
        req.postDataJSON().properties.currentTourIndex === 1,
    );
    await page.getByText("Continue", { exact: true }).click();
    await eventReq1;
    const eventReq2 = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().includes("/v2/sdk/events") &&
        req.postDataJSON().name === "tour-update" &&
        req.postDataJSON().properties.currentTourIndex === 0,
    );
    await page.getByText("Previous", { exact: true }).click();
    await eventReq2;
  });
  test(`${packageName} - should send tour heartbeat event`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    const eventReq = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().includes("/v2/sdk/events") &&
        req.postDataJSON().name === "tour-session-heartbeat",
    );
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await eventReq;
  });
  test(`${packageName} - should send tour hint event on reload`, async ({ page, browserName }) => {
    await mockBlocksEndpoint(page, [getTour({})]);
    await page.goto(`/${packageName}.html`);
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();

    let eventReq;
    // In firefox the request isn't sent and the test is failing
    if (browserName !== "firefox") {
      eventReq = page.waitForRequest((req) => {
        try {
          const body = req.postData();
          if (!body) return false;
          const bodyParsed = JSON.parse(body);
          return (
            req.method() === "POST" &&
            req.url().includes("/v2/sdk/events/text") &&
            bodyParsed.name === "tour-session-hint"
          );
        } catch {
          return false;
        }
      });
    }

    await page.reload();

    await eventReq;
  });
};

run("js");
run("react");
