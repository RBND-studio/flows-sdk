import test, { expect } from "@playwright/test";
import { getTour, mockBlocksEndpoint } from "./utils";
import type {
  ApiSurveyQuestion,
  Block,
  BlockType,
  TourStep,
  TourTriggerExpression,
  TourWait,
} from "@flows/shared";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({
  title,
  linkLabel,
  linkUrl,
  page_targeting_values,
  page_targeting_operator,
  tour_trigger,
  type = "component",
  componentType = "BasicsV2Modal",
  questions,
}: {
  type?: BlockType;
  componentType?: string;
  title: string;
  linkLabel?: string;
  linkUrl?: string;
  page_targeting_operator?: string;
  page_targeting_values?: string[];
  tour_trigger?: TourTriggerExpression[];
  questions?: ApiSurveyQuestion[];
}): Block => ({
  id: randomUUID(),
  blockStateId: randomUUID(),
  workflowId: randomUUID(),
  type,
  componentType,
  data: { title },
  exitNodes: [],
  slottable: false,
  page_targeting_operator,
  page_targeting_values,
  tour_trigger: tour_trigger ? { $and: tour_trigger } : undefined,
  survey: questions ? { id: randomUUID(), questions } : undefined,
  propertyMeta: [
    {
      key: "primaryButton",
      type: "action",
      value: {
        label: linkLabel ?? "",
        url: linkUrl,
      },
    },
  ],
});

const getTourStep = ({
  title,
  linkLabel,
  linkUrl,
  tourWait,
  page_targeting_operator,
  page_targeting_values,
}: {
  title: string;
  linkLabel?: string;
  linkUrl?: string;
  tourWait?: TourWait;
  page_targeting_operator?: string;
  page_targeting_values?: string[];
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "BasicsV2Modal",
  data: { title },
  slottable: false,
  tourWait,
  page_targeting_operator,
  page_targeting_values,
  propertyMeta: [
    {
      key: "primaryButton",
      type: "action",
      value: {
        label: linkLabel ?? "",
        url: linkUrl,
        exitNode: "continue",
      },
    },
  ],
});

const run = (packageName: string) => {
  test.describe("workflow", () => {
    test(`${packageName} - should replace with empty strings`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello {{ wrong_email }}, you are {{ wrong_age }} years old.",
          linkLabel: "Continue {{ wrong_email }}.",
          linkUrl: "https://example.com/{{wrong_email}}/profile",
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello , you are  years old.", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue ." })).toHaveAttribute(
        "href",
        "https://example.com//profile",
      );
    });
    test(`${packageName} - should fill with default value`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello {{ wrong_email | john@doe.com }}, you are {{ wrong_age | 30 }} years old.",
          linkLabel: "Continue {{ wrong_email | john@doe.com }}.",
          linkUrl: "https://example.com/{{wrong_email|john@doe.com}}/profile",
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello john@doe.com, you are 30 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue john@doe.com." })).toHaveAttribute(
        "href",
        "https://example.com/john@doe.com/profile",
      );
    });
    test(`${packageName} - should fill with user properties`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello {{ email }}, you are {{ age }} years old.",
          linkLabel: "Continue {{ email }}.",
          linkUrl: "https://example.com/{{email}}/profile",
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
        "href",
        "https://example.com/test@flows.sh/profile",
      );
    });
    test(`${packageName} - should prioritize user properties over default value`, async ({
      page,
    }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello {{ email | john@doe.com }}, you are {{ age | 30 }} years old.",
          linkLabel: "Continue {{ email | john@doe.com }}.",
          linkUrl: "https://example.com/{{email|john@doe.com}}/profile",
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
        "href",
        "https://example.com/test@flows.sh/profile",
      );
    });
    test(`${packageName} - should fill page targeting`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          page_targeting_operator: "endsWith",
          page_targeting_values: ["?age={{age}}"],
          title: "Hello World!",
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeHidden();
      await page.goto(`/${packageName}.html?age=10`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill tour trigger for survey`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello World!",
          type: "survey",
          componentType: "BasicsV2SurveyPopover",
          tour_trigger: [
            {
              type: "navigation",
              operator: "endsWith",
              value: "?age={{age}}",
            },
          ],
          questions: [
            {
              id: "1",
              type: "freeform",
              title: "My question",
              description: "My description",
              optional: true,
            },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("My question", { exact: true })).toBeHidden();
      await page.goto(`/${packageName}.html?age=10`);
      await expect(page.getByText("My question", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill tour trigger dom element for survey`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getBlock({
          title: "Hello World!",
          type: "survey",
          componentType: "BasicsV2SurveyPopover",
          tour_trigger: [
            {
              type: "click",
              value: ".age-{{age}}",
            },
          ],
          questions: [
            {
              id: "1",
              type: "freeform",
              title: "My question",
              description: "My description",
              optional: true,
            },
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("My question", { exact: true })).toBeHidden();
      await page.locator(".age-10").click();
      await expect(page.getByText("My question", { exact: true })).toBeVisible();
    });
  });
  test.describe("tour", () => {
    test(`${packageName} - should replace with empty strings`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Hello {{ wrong_email }}, you are {{ wrong_age }} years old.",
              linkLabel: "Continue {{ wrong_email }}.",
              linkUrl: "https://example.com/{{wrong_email}}/profile",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello , you are  years old.", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue ." })).toHaveAttribute(
        "href",
        "https://example.com//profile",
      );
    });
    test(`${packageName} - should fill with default value`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title:
                "Hello {{ wrong_email | john@doe.com }}, you are {{ wrong_age | 30 }} years old.",
              linkLabel: "Continue {{ wrong_email | john@doe.com }}.",
              linkUrl: "https://example.com/{{wrong_email|john@doe.com}}/profile",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello john@doe.com, you are 30 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue john@doe.com." })).toHaveAttribute(
        "href",
        "https://example.com/john@doe.com/profile",
      );
    });
    test(`${packageName} - should fill with user properties`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Hello {{ email }}, you are {{ age }} years old.",
              linkLabel: "Continue {{ email }}.",
              linkUrl: "https://example.com/{{email}}/profile",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
        "href",
        "https://example.com/test@flows.sh/profile",
      );
    });
    test(`${packageName} - should prioritize user properties over default value`, async ({
      page,
    }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Hello {{ email | john@doe.com }}, you are {{ age | 30 }} years old.",
              linkLabel: "Continue {{ email | john@doe.com }}.",
              linkUrl: "https://example.com/{{email|john@doe.com}}/profile",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
        "href",
        "https://example.com/test@flows.sh/profile",
      );
    });
    test(`${packageName} - should fill tour wait page value`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Step 1",
              linkLabel: "Continue",
            }),
            getTourStep({
              title: "",
              tourWait: {
                interaction: "navigation",
                page: {
                  operator: "endsWith",
                  value: ["?age={{age}}"],
                },
              },
            }),
            getTourStep({
              title: "Step 3",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html?age=10`);
      await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
      await page.getByText("Continue", { exact: true }).click();
      await expect(page.getByText("Step 3", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill tour wait element`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Step 1",
              linkLabel: "Continue",
              tourWait: {
                interaction: "click",
                element: ".age-{{age}}",
              },
            }),
            getTourStep({
              title: "Step 2",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
      await page.locator(".age-10").click();
      await expect(page.getByText("Step 2", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill page targeting`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tourBlocks: [
            getTourStep({
              title: "Hello World!",
              page_targeting_operator: "endsWith",
              page_targeting_values: ["?age={{age}}"],
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeHidden();
      await page.goto(`/${packageName}.html?age=10`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill tour trigger navigation for tour`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tour_trigger: [
            {
              type: "navigation",
              operator: "endsWith",
              value: "?age={{age}}",
            },
          ],
          tourBlocks: [
            getTourStep({
              title: "Hello World!",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeHidden();
      await page.goto(`/${packageName}.html?age=10`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeVisible();
    });
    test(`${packageName} - should fill tour trigger dom element for tour`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getTour({
          tour_trigger: [
            {
              type: "click",
              value: ".age-{{age}}",
            },
          ],
          tourBlocks: [
            getTourStep({
              title: "Hello World!",
            }),
          ],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello World!", { exact: true })).toBeHidden();
      await page.locator(".age-10").click();
      await expect(page.getByText("Hello World!", { exact: true })).toBeVisible();
    });
  });
};

run("js");
run("react");
