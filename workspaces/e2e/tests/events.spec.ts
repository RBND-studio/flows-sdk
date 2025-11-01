import { Block, PropertyMeta } from "@flows/shared";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({ propertyMeta }: { propertyMeta: PropertyMeta[] }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "Modal",
  data: { title: "Workflow block", body: "" },
  exitNodes: ["continue"],
  slottable: false,
  propertyMeta,
});

const run = (packageName: string) => {
  test(`${packageName} - shouldn't pass any methods without exit nodes`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        propertyMeta: [
          {
            type: "action",
            key: "primaryButton",
            value: { label: "Continue" },
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url() === "https://api.flows-cloud.com/v2/sdk/events") {
        reqWasSent = true;
      }
    });
    await page.getByText("Continue", { exact: true }).click();
    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - should pass methods with exit nodes and hide the block`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        propertyMeta: [
          {
            type: "action",
            key: "primaryButton",
            value: { label: "Continue", exitNode: "continue" },
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Workflow block", { exact: true })).toBeVisible();
    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.propertyKey === "continue"
      );
    });
    await page.getByText("Continue", { exact: true }).click();
    await req;
    await expect(page.getByText("Workflow block", { exact: true })).toBeHidden({ timeout: 0 });
  });
};

run("js");
run("react");
