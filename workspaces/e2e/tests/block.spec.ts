import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

const getBlocks = (): Block[] =>
  [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      key: "my-key",
      type: "component",
      componentType: "Modal",
      data: {},
      exitNodes: [],
      slottable: false,
      propertyMeta: [],
    },
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
          componentType: "Modal",
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
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toHaveText(JSON.stringify([]));
  });

  test(`${packageName} - return floating blocks`, async ({ page }) => {
    const blocks = getBlocks();
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks } });
    });
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".current-blocks")).toHaveText(
      JSON.stringify([
        {
          id: blocks[0]?.id,
          type: "component",
          component: "Modal",
          props: {
            __flows: {
              key: "my-key",
              workflowId: blocks[0]?.workflowId,
            },
          },
        },
        {
          id: blocks[1]?.tourBlocks?.[0]?.id,
          type: "tour-component",
          component: "Modal",
          props: {
            __flows: {
              key: "tour-block-key",
              workflowId: blocks[1]?.tourBlocks?.[0]?.workflowId,
            },
          },
        },
      ]),
    );
  });
};

run("js");
run("react");
