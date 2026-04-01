import { expect, test } from "@playwright/test";
import type { Block, TourStep } from "@flows/shared";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const floatingWorkflowBlock: Block = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: { title: "Workflow block", body: "" },
  exitNodes: [],
  slottable: false,
  propertyMeta: [],
};

const slotBlock: Block = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Card",
  data: { text: "slottable block" },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
  propertyMeta: [],
};

const getTour = (steps: TourStep[]): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: steps,
  propertyMeta: [],
});

const floatingTourBlock: TourStep = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "BasicsV2Modal",
  data: { title: "Tour block", body: "" },
  slottable: false,
};

const slotTourBlock: TourStep = {
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "Card",
  data: { text: "slottable tour block" },
  slottable: true,
  slotId: "my-slot",
};

const getSurvey = ({
  page_targeting_operator,
  page_targeting_values,
}: {
  page_targeting_operator?: string;
  page_targeting_values?: string[];
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "survey",
  componentType: "BasicsV2SurveyPopover",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
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
    ],
  },
  page_targeting_operator,
  page_targeting_values,
});

const run = (packageName: string) => {
  test(`${packageName} - should work with query params`, async ({ page }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html?param=value`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
    await page.goto(`/${packageName}.html?param=value`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });

  // Floating workflow
  test(`${packageName} - should show workflow block without page targeting`, async ({ page }) => {
    await mockBlocksEndpoint(page, [floatingWorkflowBlock]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });

  test(`${packageName} - should not show workflow block with incorrect page targeting`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "contains",
      page_targeting_values: ["/wrong"],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should show workflow block with correct page targeting`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });

  // Workflow slot
  test(`${packageName} - should not show workflow block in slot with incorrect page targeting`, async ({
    page,
  }) => {
    const block: Block = {
      ...slotBlock,
      page_targeting_operator: "contains",
      page_targeting_values: ["/wrong"],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("slottable block", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should show workflow block in slot with correct page targeting`, async ({
    page,
  }) => {
    const block: Block = {
      ...slotBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("slottable block", { exact: true })).toBeVisible();
  });

  // Floating tour
  test(`${packageName} - should show tour block without page targeting`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getTour([floatingTourBlock])]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tour block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show tour block with incorrect page targeting`, async ({
    page,
  }) => {
    const block: TourStep = {
      ...floatingTourBlock,
      page_targeting_operator: "contains",
      page_targeting_values: ["/wrong"],
    };
    await mockBlocksEndpoint(page, [getTour([block])]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tour block", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should show tour block with correct page targeting`, async ({ page }) => {
    const block: TourStep = {
      ...floatingTourBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [getTour([block])]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tour block", { exact: true })).toBeVisible();
  });

  // Tour slot
  test(`${packageName} - should not show tour block in slot with incorrect page targeting`, async ({
    page,
  }) => {
    const block: TourStep = {
      ...slotTourBlock,
      page_targeting_operator: "contains",
      page_targeting_values: ["/wrong"],
    };
    await mockBlocksEndpoint(page, [getTour([block])]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("slottable tour block", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should show tour block in slot with correct page targeting`, async ({
    page,
  }) => {
    const block: TourStep = {
      ...slotTourBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [getTour([block])]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("slottable tour block", { exact: true })).toBeVisible();
  });

  // --- Individual matchers ---
  // Not contains
  test(`${packageName} - should show block with page targeting not containing the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notContains",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting containing the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notContains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Equals
  test(`${packageName} - should show block with page targeting equal to the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "eq",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting not equal to the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "eq",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Not equals
  test(`${packageName} - should show block with page targeting not equal to the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "ne",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting equal to the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "ne",
      page_targeting_values: [`/${packageName}.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Starts with
  test(`${packageName} - should show block with page targeting starting with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "startsWith",
      page_targeting_values: [`/${packageName}`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting not starting with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "startsWith",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Ends with
  test(`${packageName} - should show block with page targeting ending with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "endsWith",
      page_targeting_values: [`.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting not ending with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "endsWith",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Doesn't start with
  test(`${packageName} - should show block with page targeting not starting with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notStartsWith",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting starting with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notStartsWith",
      page_targeting_values: [`/${packageName}`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Doesn't end with
  test(`${packageName} - should show block with page targeting not ending with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notEndsWith",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting ending with the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "notEndsWith",
      page_targeting_values: [`.html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  // Regex
  test(`${packageName} - should show block with page targeting matching the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "regex",
      page_targeting_values: [`/*..html`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not show block with page targeting not matching the current pathname`, async ({
    page,
  }) => {
    const block: Block = {
      ...floatingWorkflowBlock,
      page_targeting_operator: "regex",
      page_targeting_values: [`/wrong`],
    };
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });

  test.describe("survey", () => {
    test.skip(packageName !== "react", "Survey page-targeting coverage is only available in React");

    test(`${packageName} - should show survey without page targeting`, async ({ page }) => {
      await mockBlocksEndpoint(page, [getSurvey({})]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - should not show survey with incorrect page targeting`, async ({
      page,
    }) => {
      await mockBlocksEndpoint(
        page,
        [getSurvey({ page_targeting_operator: "contains", page_targeting_values: ["/wrong"] })],
      );
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    });

    test(`${packageName} - should show survey with correct page targeting`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getSurvey({
          page_targeting_operator: "contains",
          page_targeting_values: [`/${packageName}.html`],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });

    test(`${packageName} - should show survey with query params`, async ({ page }) => {
      await mockBlocksEndpoint(page, [
        getSurvey({
          page_targeting_operator: "contains",
          page_targeting_values: [`/${packageName}.html?param=value`],
        }),
      ]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Hello", { exact: true })).toBeHidden();
      await page.goto(`/${packageName}.html?param=value`);
      await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    });
  });
};

run("js");
run("react");
