import { expect, test } from "@playwright/test";
import { Block, TourStep } from "@flows/shared";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const floatingWorkflowBlock: Block = {
  id: "w",
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "" },
  exitNodes: [],
  slottable: false,
};

// Floating workflow
test("should show workflow block without page targeting", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [floatingWorkflowBlock] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Workflow block")).toBeVisible();
});

test("should not show workflow block with incorrect page targeting", async ({ page }) => {
  const block: Block = {
    ...floatingWorkflowBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Workflow block")).toBeHidden();
});

test("should show workflow block with correct page targeting", async ({ page }) => {
  const block: Block = {
    ...floatingWorkflowBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/js/index.html"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Workflow block")).toBeVisible();
});

const slotBlock: Block = {
  id: "w",
  type: "component",
  componentType: "Card",
  data: { text: "slottable block" },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
};

// Workflow slot
test("should not show workflow block in slot with incorrect page targeting", async ({ page }) => {
  const block: Block = {
    ...slotBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("slottable block")).toBeHidden();
});
test("should show workflow block in slot with correct page targeting", async ({ page }) => {
  const block: Block = {
    ...slotBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/js/index.html"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("slottable block")).toBeVisible();
});

const getTour = (steps: TourStep[]): Block => ({
  id: "wt",
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: steps,
});

const floatingTourModalBlock: TourStep = {
  id: "t",
  type: "tour-component",
  componentType: "Modal",
  data: { title: "Tour block", body: "" },
  slottable: false,
};

// Floating tour
test("should show tour block without page targeting", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([floatingTourModalBlock])] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Tour block")).toBeVisible();
});
test("should not show tour block with incorrect page targeting", async ({ page }) => {
  const block: TourStep = {
    ...floatingTourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Tour block")).toBeHidden();
});
test("should show tour block with correct page targeting", async ({ page }) => {
  const block: TourStep = {
    ...floatingTourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/js/index.html"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Tour block")).toBeVisible();
});

const slotTourModalBlock: TourStep = {
  id: "t",
  type: "tour-component",
  componentType: "Card",
  data: { text: "slottable tour block" },
  slottable: true,
  slotId: "my-slot",
};

// Tour slot
test("should not show tour block in slot with incorrect page targeting", async ({ page }) => {
  const block: TourStep = {
    ...slotTourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Tour block")).toBeHidden();
});
test("should show tour block in slot with correct page targeting", async ({ page }) => {
  const block: TourStep = {
    ...slotTourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/js/index.html"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.getByText("Tour block")).toBeVisible();
});
