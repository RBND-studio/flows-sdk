import { Block, TourTrigger, TourTriggerExpression, TourTriggerType } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getTour = (tour_trigger?: TourTriggerExpression[]): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  tour_trigger: tour_trigger ? { $and: tour_trigger } : undefined,
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
    await mockBlocksEndpoint(page, [getTour()]);
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
    await mockBlocksEndpoint(page, [getTour()]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to complete the tour`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour()]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should send current step event`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour()]);
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

  test.describe("tour trigger", () => {
    test(`${packageName} - should start tour`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour([{ type: "navigation", operator: "eq", values: [`/wrong`] }]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [
        getTour([{ type: "navigation", operator: "eq", values: [`/${packageName}.html`] }]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should not exit tour`, async ({ page }) => {
      const tour = getTour([
        { type: "navigation", operator: "eq", values: [`/${packageName}.html`] },
      ]);
      await mockBlocksEndpoint(page, [tour]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
      await page.getByText("changeLocation", { exact: true }).click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - click`, async ({ page }) => {
      const tour = getTour([{ type: "click", value: "h1" }]);
      await mockBlocksEndpoint(page, [tour]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getTour([{ type: "dom-element", value: "h5" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [getTour([{ type: "dom-element", value: "h1" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - not dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getTour([{ type: "not-dom-element", value: "h1" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [getTour([{ type: "not-dom-element", value: "h5" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - multiple expressions`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour([
          { type: "click", value: "h1" },
          { type: "dom-element", value: "h1" },
          { type: "not-dom-element", value: "h5" },
          { type: "navigation", operator: "eq", values: [`/${packageName}.html`] },
        ]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should start with empty expressions`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour([
          { type: "click", value: "" },
          { type: "dom-element", value: "" },
          { type: "not-dom-element", value: "" },
          { type: "navigation", operator: "eq", values: [""] },
          { type: "navigation", operator: "ne", values: [""] },
          { type: "navigation", operator: "eq", values: [] },
          { type: "navigation", values: [] },
        ]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - shouldn't start tour with invalid tour trigger config`, async ({
      page,
    }) => {
      const tour: Block = {
        ...getTour(),
        tour_trigger: { $or: [{ type: "dom-element", value: "h1" }] } as TourTrigger,
      };
      await mockBlocksEndpoint(page, [tour]);
      await page.goto(`/${packageName}.html`);
      const consoleMessagePromise = page.waitForEvent("console", (msg) => {
        return msg
          .text()
          .includes("Aborting tour start due to an unsupported tour trigger format.");
      });
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await consoleMessagePromise;
    });
    test(`${packageName} - should not start tour with invalid expression`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour([{ type: "unknown" as TourTriggerType, value: "..." }]),
      ]);
      await page.goto(`/${packageName}.html`);
      const consoleMessagePromise = page.waitForEvent("console", (msg) => {
        return msg
          .text()
          .includes("Aborting tour start due to an unrecognized tour trigger type: unknown.");
      });
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await consoleMessagePromise;
    });
  });
};

run("js");
run("react");
