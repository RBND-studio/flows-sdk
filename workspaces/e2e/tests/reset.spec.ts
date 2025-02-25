import test, { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );

  await page.route("**/v2/sdk/blocks", (route) => {
    route.fulfill({ json: { blocks: [] } });
  });
});

const run = (packageName: string) => {
  test(`${packageName} - resetAllProgress should call event endpoint`, async ({ page }) => {
    await page.goto(`/${packageName}.html`);

    let reqWasSent = false;
    page.on("request", (req) => {
      const body = req.postDataJSON();
      if (
        req.url().includes("v2/sdk/events") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.workflowId === undefined
      ) {
        reqWasSent = true;
      }
    });
    await page.getByRole("button", { name: "resetAllProgress" }).click();
    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - resetWorkflowProgress should call event endpoint`, async ({ page }) => {
    await page.goto(`/${packageName}.html`);

    let reqWasSent = false;
    page.on("request", (req) => {
      const body = req.postDataJSON();
      if (
        req.url().includes("v2/sdk/events") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "transition" &&
        body.workflowId === "my-workflow-id"
      ) {
        reqWasSent = true;
      }
    });
    await page.getByRole("button", { name: "resetWorkflowProgress" }).click();
    expect(reqWasSent).toBe(false);
  });
};

run("js");
run("react");
