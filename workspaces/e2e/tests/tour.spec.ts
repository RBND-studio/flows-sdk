import type { TourStep } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { getTour, getTourStep, mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const tourSteps: TourStep[] = [
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
];

const run = (packageName: string) => {
  test(`${packageName} - should be able to switch between tour steps`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({ tourBlocks: tourSteps })]);
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
    await mockBlocksEndpoint(page, [getTour({ tourBlocks: tourSteps })]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should be able to complete the tour`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({ tourBlocks: tourSteps })]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should send current step event`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour({ tourBlocks: tourSteps })]);
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
    const block = getTour({ tourBlocks: tourSteps, tourSessionEndAction: "cancel" });
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    const eventReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.method() === "POST" &&
        req.url().includes("/v2/sdk/events") &&
        body.name === "tour-session-heartbeat" &&
        body.blockIds.includes(block.id)
      );
    });
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    await eventReq;
  });
  test(`${packageName} - should send tour hint ending event on reload`, async ({
    page,
    browserName,
  }) => {
    await mockBlocksEndpoint(page, [getTour({ tourBlocks: tourSteps })]);
    await page.goto(`/${packageName}.html`);
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();

    let eventReq;
    // In firefox the request isn't sent and the test is failing
    if (browserName !== "firefox") {
      eventReq = page.waitForRequest((req) => {
        const body = req.postDataJSON();
        return (
          req.method() === "POST" &&
          req.url().includes("/v2/sdk/events") &&
          body.name === "tour-session-hint" &&
          body.properties.ending === true
        );
      });
    }

    await page.reload();

    await eventReq;
  });
  test(`${packageName} - should send tour hint interrupted event on reload`, async ({ page }) => {
    const interruptedTour = getTour({ tourSessionEndAction: "cancel", tourBlocks: tourSteps });
    await mockBlocksEndpoint(page, [
      interruptedTour,
      getTour({ tourBlocks: tourSteps, tour_trigger: [{ type: "click", value: "h1" }] }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
    const eventReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.method() === "POST" &&
        req.url().includes("/v2/sdk/events") &&
        body.name === "tour-session-hint" &&
        body.properties.interrupted === true &&
        body.blockId === interruptedTour.id
      );
    });
    await page.locator("h1").click();
    await eventReq;
  });
  test(`${packageName} - should show two tours with concurrency enabled`, async ({ page }) => {
    await mockBlocksEndpoint(
      page,
      [
        getTour({ tourBlocks: [getTourStep({ data: { title: "Hello" } })] }),
        getTour({ tourBlocks: [getTourStep({ data: { title: "World" } })] }),
      ],
      { tour_concurrency: true },
    );
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
  });
  test(`${packageName} - click triggered tour should be running after refresh`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [
      getTour({
        tourBlocks: tourSteps,
        tour_trigger: [{ type: "click", value: "h1" }],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
  });
};

run("js");
run("react");
