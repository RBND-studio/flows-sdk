import { Block, TourStep } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

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

const getModalStep = ({
  title,
  wait,
}: {
  title: string;
  wait?: TourStep["tourWait"];
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour-component",
  componentType: "Modal",
  data: {
    title,
    body: "",
    continueText: "Continue",
    previousText: "Previous",
    showCloseButton: false,
    hideOverlay: true,
  },
  tourWait: wait,
  slottable: false,
});

const getWaitStep = (tourWait: TourStep["tourWait"]): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "wait",
  slottable: false,
  data: {},
  tourWait,
});

const run = (packageName: string) => {
  test(`${packageName} - should wait for next step`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Hello" }),
              getWaitStep({
                interaction: "click",
                element: "h1",
                page: { operator: "contains", value: ["?correct=true"] },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not trigger wait on incorrect page`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Hello" }),
              getWaitStep({
                interaction: "click",
                element: "h1",
                page: { operator: "contains", value: ["?correct=true"] },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should not trigger wait by clicking on incorrect element`, async ({
    page,
  }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Hello" }),
              getWaitStep({
                interaction: "click",
                element: "h1",
                page: { operator: "contains", value: ["?correct=true"] },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h2").click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should wait for modal wait`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({
                title: "Hello",
                wait: {
                  interaction: "click",
                  element: "h1",
                  page: { operator: "contains", value: ["?correct=true"] },
                },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeVisible();
  });
  test(`${packageName} - should not trigger modal wait on incorrect page`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({
                title: "Hello",
                wait: {
                  interaction: "click",
                  element: "h1",
                  page: {
                    operator: "contains",
                    value: ["?correct=true"],
                  },
                },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h1").click();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });
  test(`${packageName} - should not trigger modal wait by clicking on incorrect element`, async ({
    page,
  }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({
                title: "Hello",
                wait: {
                  interaction: "click",
                  element: "h1",
                  page: { operator: "contains", value: ["?correct=true"] },
                },
              }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.locator("h2").click();
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
  });

  test(`${packageName} - should wait for delay wait`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Hello" }),
              getWaitStep({ interaction: "delay", ms: 1000 }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello", { exact: true })).toBeHidden();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.waitForTimeout(900);
    await expect(page.getByText("World", { exact: true })).toBeHidden({ timeout: 0 });
    await page.waitForTimeout(100);
    await expect(page.getByText("World", { exact: true })).toBeVisible({ timeout: 0 });
  });
  test(`${packageName} - should not trigger delay when step is not active`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Hello" }),
              getModalStep({ title: "Waiting 1000ms", wait: { interaction: "delay", ms: 1000 } }),
              getModalStep({ title: "World" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible();
    await expect(page.getByText("World", { exact: true })).toBeHidden();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Waiting 1000ms", { exact: true })).toBeVisible();
    await page.getByText("Previous", { exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText("Hello", { exact: true })).toBeVisible({ timeout: 0 });
    await expect(page.getByText("World", { exact: true })).toBeHidden({ timeout: 0 });
  });
  test(`${packageName} - should trigger wait on dom element`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Step 1" }),
              getModalStep({
                title: "Step 2",
                wait: {
                  interaction: "dom-element",
                  element: "h1",
                  page: { operator: "contains", value: ["?correct=true"] },
                },
              }),
              getModalStep({ title: "Step 3" }),
              getModalStep({
                title: "Step 4",
                wait: { interaction: "dom-element", element: ".wrong-el" },
              }),
              getModalStep({
                title: "Step 5",
                wait: {
                  interaction: "dom-element",
                  element: "h1",
                  page: { operator: "contains", value: ["?correct=false"] },
                },
              }),
              getModalStep({ title: "Step 6" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html?correct=true`);
    await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 3", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 4", { exact: true })).toBeVisible({ timeout: 0 });
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 5", { exact: true })).toBeVisible({ timeout: 0 });
  });
  test(`${packageName} - should trigger wait on not-dom element`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({
        json: {
          blocks: [
            getTour([
              getModalStep({ title: "Step 1" }),
              getModalStep({
                title: "Step 2",
                wait: { interaction: "not-dom-element", element: ".wrong-el" },
              }),
              getModalStep({ title: "Step 3" }),
              getModalStep({
                title: "Step 4",
                wait: { interaction: "not-dom-element", element: "h1" },
              }),
              getModalStep({
                title: "Step 5",
                wait: {
                  interaction: "not-dom-element",
                  element: ".wrong-el",
                  page: { operator: "contains", value: ["?correct=false"] },
                },
              }),
              getModalStep({ title: "Step 6" }),
            ]),
          ],
        },
      });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 3", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 4", { exact: true })).toBeVisible({ timeout: 0 });
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Step 5", { exact: true })).toBeVisible({ timeout: 0 });
  });
};

run("js");
run("react");
