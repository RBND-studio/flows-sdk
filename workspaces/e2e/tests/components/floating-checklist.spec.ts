import { Block, ChecklistPosition, PropertyMeta } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "../utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const skipButton: PropertyMeta = {
  type: "action",
  key: "skipButton",
  value: { label: "Skip checklist", exitNode: "close" },
};
const completedButton: PropertyMeta = {
  type: "action",
  key: "completedButton",
  value: { label: "Complete checklist", exitNode: "complete" },
};
const primaryButton: PropertyMeta = {
  type: "action",
  key: "items.0.primaryButton",
  value: { label: "Start tour", exitNode: "tour-start" },
};
const secondaryButton: PropertyMeta = {
  type: "action",
  key: "items.0.secondaryButton",
  value: { label: "Learn more", url: "https://example.com", openInNew: true },
};
const completedStateMemory: PropertyMeta = {
  type: "state-memory",
  key: "items.0.completed",
  value: false,
  triggers: [{ type: "manual" }],
};

const getBlock = ({
  propertyMeta,
  position,
  items,
  defaultOpen,
  hideOnClick,
}: {
  propertyMeta?: PropertyMeta[];
  position?: ChecklistPosition;
  items?: { title: string; description: string }[];
  defaultOpen?: boolean;
  hideOnClick?: boolean;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2FloatingChecklist",
  slottable: false,
  data: {
    widgetTitle: "Widget title",
    popupTitle: "Popup title",
    popupDescription: "This is a description",
    position,
    defaultOpen: defaultOpen ?? false,
    hideOnClick: hideOnClick ?? false,
    items: items ?? [
      {
        title: "Item 1",
        description: "This is item 1",
      },
    ],
    completedTitle: "All done!",
    completedDescription: "You have completed the checklist.",
  },
  exitNodes: ["complete", "close"],
  propertyMeta: propertyMeta ?? [
    skipButton,
    completedButton,
    primaryButton,
    secondaryButton,
    completedStateMemory,
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should render checklist`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({})]);
    await page.goto(`/${packageName}.html`);
    const checklistWidget = page.getByRole("button", { name: "Widget title" });
    await expect(checklistWidget).toBeVisible();
    const checklistPopover = page.locator(".flows_basicsV2_floating_checklist_popover");
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
    const checklistItemContent = page.locator(".flows_basicsV2_floating_checklist_item_content");
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
  test(`${packageName} - should hide checklist on item button click if hideOnClick is true`, async ({
    page,
  }) => {
    // Primary button
    await mockBlocksEndpoint(page, [getBlock({ hideOnClick: true })]);
    await page.goto(`/${packageName}.html`);
    const checklistWidget = page.getByRole("button", { name: "Widget title" });
    await expect(checklistWidget).toBeVisible();
    const checklistPopover = page.locator(".flows_basicsV2_floating_checklist_popover");
    await expect(checklistPopover).toBeHidden();
    await checklistWidget.click();
    await expect(checklistPopover).toBeVisible();
    await page.getByRole("button", { name: "Item 1" }).click();
    await page.getByRole("button", { name: "Start tour" }).click();
    await expect(checklistPopover).toBeHidden();
    await expect(checklistWidget).toBeFocused();

    // Secondary button
    await page.goto(`/${packageName}.html`);
    await page.getByRole("button", { name: "Widget title" }).click();
    await page.getByRole("button", { name: "Item 1" }).click();
    await page.getByRole("link", { name: "Learn more" }).click();
    await expect(page.locator(".flows_basicsV2_floating_checklist_popover")).toBeHidden();
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
    await expect(page.locator(".flows_basicsV2_floating_checklist_popover")).toBeVisible();
    await expect(page.locator(".flows_basicsV2_floating_checklist_skip_button")).toBeHidden();
    await page.getByRole("button", { name: "Item 1" }).click();
    await expect(page.locator(".flows_basicsV2_floating_checklist_item_buttons")).toBeHidden();
  });
  test(`${packageName} - should show completed state`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        propertyMeta: [
          skipButton,
          completedButton,
          primaryButton,
          secondaryButton,
          {
            type: "state-memory",
            key: "items.0.completed",
            value: true,
            triggers: [{ type: "manual" }],
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await page.getByRole("button", { name: "Widget title" }).click();
    await expect(page.locator(".flows_basicsV2_floating_checklist_popover")).toBeVisible();
    await expect(page.locator(".flows_basicsV2_floating_checklist_items")).toBeHidden();
    await expect(page.locator(".flows_basicsV2_floating_checklist_skip_button")).toBeHidden();
    await expect(page.locator(".flows_basicsV2_floating_checklist_completed")).toBeVisible();
    await expect(page.locator(".flows_basicsV2_floating_checklist_popover")).toMatchAriaSnapshot(`
- paragraph: Popup title
- paragraph: This is a description
- paragraph: 1 / 1
- progressbar
- paragraph: All done!
- paragraph: You have completed the checklist.
- button "Complete checklist"`);
  });
  test(`${packageName} - should render bottom right by default`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock({ position: undefined })]);
    await page.goto(`/${packageName}.html`);
    await expect(
      page.locator(".flows_basicsV2_floating_checklist[data-position='bottom-right']"),
    ).toBeVisible();
  });
  test(`${packageName} - primary button should complete item if only manual trigger is present and close the item`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        items: [
          {
            title: "Item 1",
            description: "This is item 1",
          },
          {
            title: "Item 2",
            description: "This is item 2",
          },
        ],
        propertyMeta: [
          skipButton,
          completedButton,
          primaryButton,
          secondaryButton,
          completedStateMemory,
          {
            type: "state-memory",
            key: "items.1.completed",
            value: false,
            triggers: [{ type: "manual" }],
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await page.getByRole("button", { name: "Widget title" }).click();
    await expect(page.getByText("0 / 2", { exact: true })).toBeVisible();
    await expect(
      page.locator(".flows_basicsV2_floating_checklist_item[data-expanded='false']"),
    ).toHaveCount(2);
    await page.getByRole("button", { name: "Item 1" }).click();
    await expect(
      page.locator(".flows_basicsV2_floating_checklist_item[data-expanded='true']"),
    ).toBeVisible();
    await page.getByText("Start tour", { exact: true }).click();
    await expect(
      page.locator(".flows_basicsV2_floating_checklist_item[data-expanded='false']"),
    ).toHaveCount(2);
    await expect(page.getByText("1 / 2", { exact: true })).toBeVisible();
  });
  test(`${packageName} - default open and should persist open state in session storage`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [getBlock({ defaultOpen: true })]);
    await page.goto(`/${packageName}.html`);
    const checklistWidget = page.getByRole("button", { name: "Widget title" });
    const checklistPopover = page.locator(".flows_basicsV2_floating_checklist_popover");
    await expect(checklistPopover).toBeVisible();
    await checklistWidget.click();
    await expect(checklistPopover).toBeHidden();
    await page.reload();
    await expect(checklistPopover).toBeHidden();
    await checklistWidget.click();
    await expect(checklistPopover).toBeVisible();
    await page.reload();
    await expect(checklistPopover).toBeVisible();
  });
};

run("react");
run("js");
