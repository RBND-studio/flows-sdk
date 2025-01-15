import { expect, test } from "@playwright/test";
import { Block, TourStep } from "@flows/shared";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const workflowBlock: Block = {
  id: "w",
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "" },
  exitNodes: [],
  slottable: false,
};

const tourModalBlock: TourStep = {
  id: "t",
  type: "tour-component",
  componentType: "Modal",
  data: { title: "Tour block", body: "" },
  slottable: false,
};
const getTour = (steps: TourStep[]): Block => ({
  id: "wt",
  type: "tour",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  tourBlocks: steps,
});

test("should show workflow block without page targeting", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [workflowBlock] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Workflow block")).toBeVisible();
});

test("should not show workflow block with incorrect page targeting", async ({ page }) => {
  const block: Block = {
    ...workflowBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Workflow block")).toBeHidden();
});

test("should show workflow block with correct page targeting", async ({ page }) => {
  const block: Block = {
    ...workflowBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/page-targeting"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [block] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Workflow block")).toBeVisible();
});

test("should show tour block without page targeting", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([tourModalBlock])] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Tour block")).toBeVisible();
});
test("should not show tour block with incorrect page targeting", async ({ page }) => {
  const block: TourStep = {
    ...tourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/wrong"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Tour block")).toBeHidden();
});
test("should show tour block with correct page targeting", async ({ page }) => {
  const block: TourStep = {
    ...tourModalBlock,
    page_targeting_operator: "contains",
    page_targeting_values: ["/page-targeting"],
  };
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getTour([block])] } });
  });
  await page.goto(`/js/page-targeting/page-targeting.html`);
  await expect(page.getByText("Tour block")).toBeVisible();
});
