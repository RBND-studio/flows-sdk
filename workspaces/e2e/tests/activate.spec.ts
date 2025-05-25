import { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";

const getBlock = ({ componentType }: { componentType: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType,
  data: {},
  exitNodes: [],
  slottable: false,
});

const getTour = ({ componentType }: { componentType: string }): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "tour",
  data: {},
  exitNodes: [],
  slottable: false,
  tourBlocks: [
    {
      id: randomUUID(),
      workflowId: randomUUID(),
      data: {},
      slottable: false,
      type: "tour-component",
      componentType,
    },
  ],
});

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const run = (packageName: string) => {
  test(`${packageName} - shouldn't call activate without matching component`, async ({ page }) => {
    const wrongCmpBlock = getBlock({ componentType: "WrongCmp" });
    const modalBlock = getBlock({ componentType: "Modal" });
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [wrongCmpBlock, modalBlock] } });
    });
    await page.goto(`/${packageName}.html?noCurrentBlocks=true`);
    let wrongCmpReqWasSent = false;
    let modalReqWasSent = false;
    page.on("request", (req) => {
      const body = req.postDataJSON();
      if (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        body.name === "block-activated" &&
        body.blockId === wrongCmpBlock.id
      )
        wrongCmpReqWasSent = true;

      if (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        body.name === "block-activated" &&
        body.blockId === modalBlock.id
      )
        modalReqWasSent = true;
    });

    await expect(page.locator(".flows_modal_modal")).toBeVisible();
    expect(wrongCmpReqWasSent).toBe(false);
    expect(modalReqWasSent).toBe(true);
  });
  test(`${packageName} - should call activate for workflow block`, async ({ page }) => {
    const block = getBlock({ componentType: "Modal" });
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html?noCurrentBlocks=true`);
    await page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "block-activated" &&
        body.blockId === block.id
      );
    });
  });
  test(`${packageName} - should call activate for tour block`, async ({ page }) => {
    const block = getTour({ componentType: "Modal" });
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [block] } });
    });
    await page.goto(`/${packageName}.html?noCurrentBlocks=true`);
    await page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "block-activated" &&
        body.blockId === block.tourBlocks?.[0]?.id
      );
    });
  });
};

run("js");
run("react");
