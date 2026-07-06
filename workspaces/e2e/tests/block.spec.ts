import type { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

const getWorkflowBlock = (blockStateId = randomUUID()): Block => ({
  id: randomUUID(),
  blockStateId,
  workflowId: randomUUID(),
  key: "my-key",
  type: "component",
  componentType: "BasicsV2Modal",
  data: {
    title: "Hello World!",
  },
  exitNodes: ["continue"],
  slottable: false,
  propertyMeta: [
    {
      type: "action",
      key: "primaryButton",
      value: { label: "Continue", exitNode: "continue" },
    },
  ],
});

const getUnknownComponentBlock = (): Block => ({
  id: randomUUID(),
  blockStateId: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "UnknownComponent",
  data: {},
  exitNodes: [],
  slottable: false,
  propertyMeta: [],
});

const getBlocks = (): Block[] =>
  [
    getWorkflowBlock(),
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      data: {},
      exitNodes: [],
      slottable: false,
      type: "tour",
      propertyMeta: [],
      tourBlocks: [
        {
          id: randomUUID(),
          workflowId: randomUUID(),
          data: {},
          key: "tour-block-key",
          slottable: false,
          type: "tour-component",
          componentType: "BasicsV2Modal",
        },
      ],
    },
  ] satisfies Block[];

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const run = (packageName: string) => {
  test(`${packageName} - return empty blocks`, async ({ page }) => {
    await mockBlocksEndpoint(page, []);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toHaveText(JSON.stringify([]));
  });

  test(`${packageName} - return floating blocks`, async ({ page }) => {
    const blocks = getBlocks();
    await mockBlocksEndpoint(page, blocks);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toHaveText(
      JSON.stringify([
        {
          id: blocks[0]?.id,
          type: "component",
          component: "BasicsV2Modal",
          props: {
            __flows: {
              id: blocks[0]?.id,
              key: "my-key",
              workflowId: blocks[0]?.workflowId,
              freeOrg: false,
            },
            title: blocks[0]?.data?.title,
            primaryButton: {
              label: "Continue",
            },
          },
        },
        {
          id: blocks[1]?.tourBlocks?.[0]?.id,
          tourBlockId: blocks[1]?.id,
          type: "tour-component",
          component: "BasicsV2Modal",
          props: {
            __flows: {
              id: blocks[1]?.tourBlocks?.[0]?.id,
              key: "tour-block-key",
              workflowId: blocks[1]?.tourBlocks?.[0]?.workflowId,
              tourVisibleStepCount: 1,
              tourVisibleStepIndex: 0,
              freeOrg: false,
            },
          },
        },
      ]),
    );
  });
  test(`${packageName} - shouldn't show blocks that have been dismissed`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getWorkflowBlock(), getUnknownComponentBlock()]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello World!", { exact: true })).toBeVisible();
    await page.getByText("Continue", { exact: true }).click();
    await expect(page.getByText("Hello World!", { exact: true })).not.toBeVisible();
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toContainText("UnknownComponent");
    await expect(page.getByText("Hello World!", { exact: true })).toBeHidden();
  });
};

run("js");
run("react");
