import { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getCard = (props: { slotIndex?: number; text: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Card",
  data: { text: props.text },
  exitNodes: [],
  slottable: true,
  slotId: "my-slot",
  slotIndex: props.slotIndex,
  propertyMeta: [],
});

const run = (packageName: string) => {
  test(`${packageName} - should render empty slot`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Slot placeholder", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should render block in slot and hide placeholder`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [getCard({ text: "Hello world" })] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Slot placeholder", { exact: true })).toBeHidden();
    await expect(page.getByText("Hello world", { exact: true })).toBeVisible();
    await expect(page.locator(".flows-card")).toBeVisible();
  });
  test(`${packageName} - should sort blocks by slotIndex`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [getCard({ text: "block number one" }), getCard({ text: "block number two" })],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows-card").nth(0).locator(".card-text")).toHaveText(
      "block number one",
    );
    await expect(page.locator(".flows-card").nth(1).locator(".card-text")).toHaveText(
      "block number two",
    );

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
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows-card").nth(0).locator(".card-text")).toHaveText(
      "block number two",
    );
    await expect(page.locator(".flows-card").nth(1).locator(".card-text")).toHaveText(
      "block number one",
    );

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
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows-card").nth(0).locator(".card-text")).toHaveText(
      "block number one",
    );
    await expect(page.locator(".flows-card").nth(1).locator(".card-text")).toHaveText(
      "block number two",
    );
  });
};

run("js");
run("react");
