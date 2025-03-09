import test from "@playwright/test";

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
  test(`${packageName} - resetAllWorkflowsProgress should call event endpoint`, async ({
    page,
  }) => {
    await page.goto(`/${packageName}.html`);

    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url().includes("https://api.flows-cloud.com/v2/sdk/events") &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "reset-progress" &&
        body.workflowId === undefined
      );
    });
    await page.getByRole("button", { name: "resetAllWorkflowsProgress" }).click();
    await req;
  });
  test(`${packageName} - resetWorkflowProgress should call event endpoint`, async ({ page }) => {
    await page.goto(`/${packageName}.html`);

    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url().includes("https://api.flows-cloud.com/v2/sdk/events") &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "reset-progress" &&
        body.workflowId === "my-workflow-id"
      );
    });
    await page.getByRole("button", { name: "resetWorkflowProgress" }).click();
    await req;
  });
  test(`${packageName} - startWorkflow should call event endpoint`, async ({ page }) => {
    await page.goto(`/${packageName}.html`);

    const req = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url().includes("v2/sdk/events") &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.name === "workflow-start" &&
        body.blockKey === "my-start-block"
      );
    });
    await page.getByRole("button", { name: "startWorkflow" }).click();
    await req;
  });
};

run("js");
run("react");
