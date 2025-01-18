import { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getCard = (props: { slotIndex?: number; text: string }): Block => ({
  id: "c",
  type: "component",
  componentType: "Card",
  data: { text: props.text },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
  slotIndex: props.slotIndex,
});

test("should render empty slot", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.locator("flows-slot")).toBeVisible();
  await expect(page.getByText("Slot placeholder")).toBeVisible();
});
test("should render block in slot and hide placeholder", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [getCard({ text: "Hello world" })] } });
  });
  await page.goto(`/js/index.html`);
  await expect(page.locator("flows-slot")).toBeVisible();
  await expect(page.getByText("Slot placeholder")).toBeHidden();
  await expect(page.getByText("Hello world")).toBeVisible();
  await expect(page.locator(".flows-card")).toBeVisible();
});
test("should sort blocks by slotIndex", async ({ page }) => {
  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({
      json: {
        blocks: [getCard({ text: "block number one" }), getCard({ text: "block number two" })],
      },
    });
  });
  await page.goto(`/js/index.html`);
  await expect(page.locator("flows-slot")).toBeVisible();
  await expect(page.locator(".flows-card").nth(0)).toHaveText("block number one");
  await expect(page.locator(".flows-card").nth(1)).toHaveText("block number two");

  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({
      json: {
        blocks: [
          getCard({ text: "block number one", slotIndex: 1 }),
          getCard({ text: "block number two" }),
        ],
      },
    });
  });
  await page.goto(`/js/index.html`);
  await expect(page.locator("flows-slot")).toBeVisible();
  await expect(page.locator(".flows-card").nth(0)).toHaveText("block number two");
  await expect(page.locator(".flows-card").nth(1)).toHaveText("block number one");

  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({
      json: {
        blocks: [
          getCard({ text: "block number one", slotIndex: 1 }),
          getCard({ text: "block number two", slotIndex: 2 }),
        ],
      },
    });
  });
  await page.goto(`/js/index.html`);
  await expect(page.locator("flows-slot")).toBeVisible();
  await expect(page.locator(".flows-card").nth(0)).toHaveText("block number one");
  await expect(page.locator(".flows-card").nth(1)).toHaveText("block number two");
});
