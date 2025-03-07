import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

const getBlocks = (): Block[] =>
  [
    {
      id: randomUUID(),
      key: "my-key",
      type: "component",
      componentType: "Modal",
      data: {},
      exitNodes: [],
      slottable: false,
    },
    {
      id: randomUUID(),
      data: {},
      exitNodes: [],
      slottable: false,
      type: "tour",
      tourBlocks: [
        {
          id: randomUUID(),
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
          props: { __flows: { key: "my-key" } },
        },
        {
          id: blocks[1]?.tourBlocks?.[0]?.id,
          type: "tour-component",
          component: "Modal",
          props: { __flows: { key: "tour-block-key" } },
        },
      ]),
    );
  });
};

run("js");
run("react");
