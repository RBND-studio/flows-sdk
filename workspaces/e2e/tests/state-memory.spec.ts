import { Block } from "@flows/shared";
import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlocks = (): Block[] => [
  {
    id: randomUUID(),
    workflowId: randomUUID(),
    data: {
      title: "State Memory Title",
    },
    propertyMeta: [
      {
        key: "checked",
        type: "state-memory",
        value: false,
        triggers: [{ type: "transition", blockId: "bId" }],
      },
      {
        key: "checked2",
        type: "state-memory",
        value: false,
      },
    ],
    slottable: false,
    exitNodes: [],
    type: "component",
    componentType: "StateMemory",
  },
];

const run = (packageName: string) => {
  test(`${packageName} - should add state memory to props`, async ({ page }) => {
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
          component: "StateMemory",
          props: {
            __flows: {
              id: blocks[0]?.id,
              workflowId: blocks[0]?.workflowId,
            },
            title: "State Memory Title",
            checked: {
              value: false,
              triggers: [{ type: "transition", blockId: "bId" }],
            },
            checked2: {
              value: false,
              triggers: [],
            },
          },
        },
      ]),
    );
    await expect(page.getByText("State Memory Title", { exact: true })).toBeVisible();
    await expect(page.getByText("checked: false", { exact: true })).toBeVisible();
    const trueRequest = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "set-state-memory" &&
        body.blockId === blocks[0]?.id &&
        body.propertyKey === "checked" &&
        body.properties.value === true
      );
    });
    await page.getByText("true", { exact: true }).click();
    await trueRequest;
    await expect(page.getByText("checked: true", { exact: true })).toBeVisible({ timeout: 0 });
    await expect(page.getByText("checked: false", { exact: true })).toBeHidden({ timeout: 0 });
    const falseRequest = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "set-state-memory" &&
        body.blockId === blocks[0]?.id &&
        body.propertyKey === "checked" &&
        body.properties.value === false
      );
    });
    await page.getByText("false", { exact: true }).click();
    await expect(page.getByText("checked: false", { exact: true })).toBeVisible({ timeout: 0 });
    await expect(page.getByText("checked: true", { exact: true })).toBeHidden({ timeout: 0 });
    await falseRequest;
  });
};

run("js");
run("react");
