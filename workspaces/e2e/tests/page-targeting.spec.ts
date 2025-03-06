import { expect, test } from "@playwright/test";
import { Block, TourStep } from "@flows/shared";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const floatingWorkflowBlock: Block = {
  id: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "" },
  exitNodes: [],
  slottable: false,
};

const slotBlock: Block = {
  id: randomUUID(),
  type: "component",
  componentType: "Card",
  data: { text: "slottable block" },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
};

const getTour = (steps: TourStep[]): Block => ({
  id: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: steps,
});

const floatingTourBlock: TourStep = {
  id: randomUUID(),
  type: "tour-component",
  componentType: "Modal",
  data: { title: "Tour block", body: "" },
  slottable: false,
};

const slotTourBlock: TourStep = {
  id: randomUUID(),
  type: "tour-component",
  componentType: "Card",
  data: { text: "slottable tour block" },
  slottable: true,
  slotId: "my-slot",
};

const run = (packageName: string) => {
  // Floating workflow
  test(`${packageName} - should show workflow block without page targeting`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [floatingWorkflowBlock] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("slottable block", { exact: true })).toBeVisible();
  });

  // Floating tour
  test(`${packageName} - should show tour block without page targeting`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTour([floatingTourBlock])] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTour([block])] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Tour block", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should show tour block with correct page targeting`, async ({ page }) => {
    const block: TourStep = {
      ...floatingTourBlock,
      page_targeting_operator: "contains",
      page_targeting_values: [`/${packageName}.html`],
    };
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTour([block])] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTour([block])] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getTour([block])] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
      page_targeting_values: [`/*.\.html`],
    };
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden();
  });
};

run("js");
run("react");
