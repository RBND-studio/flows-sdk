import type { Block, TourTrigger, TourTriggerExpression, TourTriggerType } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getTour = ({
  tour_trigger,
  currentTourIndex,
}: {
  tour_trigger?: TourTriggerExpression[];
  currentTourIndex?: number;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  propertyMeta: [],
  tour_trigger: tour_trigger ? { $and: tour_trigger } : undefined,
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

const getSurvey = (tour_trigger?: TourTriggerExpression[]): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "survey",
  componentType: "BasicsV2SurveyPopover",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tour_trigger: tour_trigger ? { $and: tour_trigger } : undefined,
  survey: {
    id: randomUUID(),
    blockStateId: randomUUID(),
    questions: [
      {
        id: "question-1",
        type: "freeform",
        title: "Hello",
        description: "Question",
        optional: true,
      },
      {
        id: "question-2",
        type: "freeform",
        title: "World",
        description: "Question",
        optional: true,
      },
    ],
  },
});

const run = (packageName: string) => {
  test.describe("tour", () => {
    test(`${packageName} - should start tour`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({ tour_trigger: [{ type: "navigation", operator: "eq", values: [`/wrong`] }] }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [
        getTour({
          tour_trigger: [{ type: "navigation", operator: "eq", values: [`/${packageName}.html`] }],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should not exit tour`, async ({ page }) => {
      const tour = getTour({
        tour_trigger: [{ type: "navigation", operator: "eq", values: [`/${packageName}.html`] }],
      });
      await mockBlocksEndpoint(page, [tour]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
      await page.getByText("changeLocation", { exact: true }).click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should ignore trigger with running tour`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          currentTourIndex: 1,
          tour_trigger: [{ type: "navigation", operator: "eq", values: [`/wrong`] }],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("World", { exact: true })).toBeVisible();
    });
    test(`${packageName} - click`, async ({ page }) => {
      const tour = getTour({ tour_trigger: [{ type: "click", value: "h1" }] });
      await mockBlocksEndpoint(page, [tour]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({ tour_trigger: [{ type: "dom-element", value: "h5" }] }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [
        getTour({ tour_trigger: [{ type: "dom-element", value: "h1" }] }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - not dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({ tour_trigger: [{ type: "not-dom-element", value: "h1" }] }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await mockBlocksEndpoint(page, [
        getTour({ tour_trigger: [{ type: "not-dom-element", value: "h5" }] }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - multiple expressions`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tour_trigger: [
            { type: "click", value: "h1" },
            { type: "dom-element", value: "h1" },
            { type: "not-dom-element", value: "h5" },
            { type: "navigation", operator: "eq", values: [`/${packageName}.html`] },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should start with empty expressions`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tour_trigger: [
            { type: "click", value: "" },
            { type: "dom-element", value: "" },
            { type: "not-dom-element", value: "" },
            { type: "navigation", operator: "eq", values: [""] },
            { type: "navigation", operator: "ne", values: [""] },
            { type: "navigation", operator: "eq", values: [] },
            { type: "navigation", values: [] },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
    test(`${packageName} - shouldn't start tour with invalid tour trigger config`, async ({
      page,
    }) => {
      const tour: Block = {
        ...getTour({}),
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
        getTour({ tour_trigger: [{ type: "unknown" as TourTriggerType, value: "..." }] }),
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

  test.describe("survey", () => {
    test(`${packageName} - should start survey`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getSurvey([{ type: "navigation", operator: "eq", values: ["/wrong"] }]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();

      await mockBlocksEndpoint(page, [
        getSurvey([{ type: "navigation", operator: "eq", values: [`/${packageName}.html`] }]),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - should not exit survey`, async ({ page }) => {
      const block = getSurvey([
        { type: "navigation", operator: "eq", values: [`/${packageName}.html`] },
      ]);
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
      await page.getByText("changeLocation", { exact: true }).click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - should ignore trigger with running survey`, async ({ page }) => {
      const block = getSurvey([{ type: "navigation", operator: "eq", values: ["/wrong"] }]);
      await page.addInitScript((surveyId) => {
        window.sessionStorage.setItem("flows-running-surveys", JSON.stringify([surveyId]));
      }, block.id);
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - click`, async ({ page }) => {
      const block = getSurvey([{ type: "click", value: "h1" }]);
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getSurvey([{ type: "dom-element", value: "h5" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();

      await mockBlocksEndpoint(page, [getSurvey([{ type: "dom-element", value: "h1" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - not dom element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getSurvey([{ type: "not-dom-element", value: "h1" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();

      await mockBlocksEndpoint(page, [getSurvey([{ type: "not-dom-element", value: "h5" }])]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - multiple expressions`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getSurvey([
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
        getSurvey([
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

    test(`${packageName} - shouldn't start survey with invalid tour trigger config`, async ({
      page,
    }) => {
      const block: Block = {
        ...getSurvey([]),
        tour_trigger: { $or: [{ type: "dom-element", value: "h1" }] } as TourTrigger,
      };
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      const consoleMessagePromise = page.waitForEvent("console", (msg) => {
        return msg
          .text()
          .includes("Aborting tour start due to an unsupported tour trigger format.");
      });
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await consoleMessagePromise;
    });

    test(`${packageName} - should not start survey with invalid expression`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getSurvey([{ type: "unknown" as TourTriggerType, value: "..." }]),
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
    test(`${packageName} - should save running surveys to sessionStorage`, async ({ page }) => {
      const block = getSurvey([{ type: "click", value: "h1" }]);
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.locator("h1").click();
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
      await page.getByText("Next", { exact: true }).click();
      await expect(page.getByText("World", { exact: true })).toBeVisible();
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.reload();
      await expect(page.getByText("World", { exact: true })).toBeVisible();
    });
  });
};

run("js");
run("react");
