import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlocks = (): Block[] => {
  const workflowId = randomUUID();
  const blockStateValue: Block = {
    id: randomUUID(),
    workflowId,
    data: {
      title: "Block State Title",
    },
    propertyMeta: [{ key: "checked2", type: "state-memory" }],
    slottable: false,
    exitNodes: [],
    type: "component",
    componentType: "BlockStateCmp",
  };

  return [
    {
      id: randomUUID(),
      workflowId,
      data: {
        title: "Modal Title",
      },
      propertyMeta: [
        {
          key: "blockState",
          type: "block-state",
          value: blockStateValue,
        },
      ],
      slottable: false,
      exitNodes: [],
      type: "component",
      componentType: "Modal",
    },
  ];
};

const run = (packageName: string) => {
  test(`${packageName} - should pass block state to the component props`, async ({ page }) => {
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
              id: blocks[0]?.id,
              workflowId: blocks[0]?.workflowId,
            },
            title: "Modal Title",
            blockState: {
              __flows: {
                id: (blocks[0]?.propertyMeta?.[0]?.value as any)?.id,
                workflowId: blocks[0]?.workflowId,
              },
              title: "Block State Title",
              checked2: {
                value: false,
                triggers: [],
              },
            },
          },
        },
      ]),
    );
  });
};

run("js");
run("react");
