import { Block, PropertyMeta } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "../utils";
import { exitCode, title } from "process";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({ propertyMeta }: { propertyMeta?: PropertyMeta[] }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Checklist",
  slottable: false,
  data: {
    widgetTitle: "Widget title",
    popupTitle: "Popup title",
    popupDescription: "This is a description",
    position: "bottom-right",

    items: [
      {
        title: "Item 1",
        description: "This is item 1",
      },
    ],
  },
  exitNodes: ["complete", "close"],
  propertyMeta: propertyMeta ?? [
    {
      type: "action",
      key: "skipButton",
      value: { label: "Skip checklist", exitNode: "close" },
    },
    {
      type: "action",
      key: "items.0.primaryButton",
      value: { label: "Start tour", exitNode: "tour-start" },
    },
    {
      type: "action",
      key: "items.0.secondaryButton",
      value: { label: "Learn more", url: "https://example.com", openInNew: true },
    },
    {
      type: "state-memory",
      key: "items.0.completed",
      value: false,
      triggers: [{ type: "manual" }],
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should render checklist`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({})]);
    await page.goto(`/${packageName}.html`);
    const checklistWidget = page.getByRole("button", { name: "Widget title" });
    await expect(checklistWidget).toBeVisible();
    const checklistPopover = page.locator(".flows_basicsV2_checklist_popover");
    await expect(checklistPopover).toBeHidden();
    await checklistWidget.click();
    await expect(checklistPopover).toBeVisible();
    await expect(checklistPopover).toMatchAriaSnapshot(`
- paragraph: Popup title
- paragraph: This is a description
- paragraph: 0 / 1
- progressbar
- button "Item 1"
- paragraph: This is item 1
- button "Start tour"
- link "Learn more":
  - /url: https://example.com
- button "Skip checklist"`);
    const checklistItemContent = page.locator(".flows_basicsV2_checklist_item_content");
    await expect(checklistItemContent).toBeHidden();
    const checklistItemButton = page.getByRole("button", { name: "Item 1" });
    await checklistItemButton.click();
    await expect(checklistItemContent).toBeVisible();

    await checklistItemButton.click();
    await expect(checklistItemContent).toBeHidden();

    await checklistWidget.click();
    await expect(checklistPopover).toBeHidden();

    await checklistWidget.click();
    await page.getByText("Skip checklist", { exact: true }).click();
    await expect(checklistPopover).toBeHidden();
    await expect(checklistWidget).toBeHidden();
  });

  test(`${packageName} - shouldn't render skip button without action`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        propertyMeta: [
          {
            type: "state-memory",
            key: "items.0.completed",
            value: false,
            triggers: [{ type: "manual" }],
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await page.getByRole("button", { name: "Widget title" }).click();
    await expect(page.locator(".flows_basicsV2_checklist_popover")).toBeVisible();
    await expect(page.locator(".flows_basicsV2_checklist_skip_button")).toBeHidden();
    await page.getByRole("button", { name: "Item 1" }).click();
    await expect(page.locator(".flows_basicsV2_checklist_item_buttons")).toBeHidden();
  });
};

run("react");
run("js");
