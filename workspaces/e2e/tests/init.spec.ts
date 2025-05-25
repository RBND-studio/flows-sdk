import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const run = (packageName: string) => {
  test(`${packageName} - should call blocks with correct parameters`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" &&
        /@flows\/[^@]*@\d+\.\d+.\d+/.test(headers["x-flows-version"] ?? "") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.userProperties.email === "test@flows.sh" &&
        body.userProperties.age === 10 &&
        body.locale === undefined
      );
    });
    await page.goto(`/${packageName}.html`);
    await blocksReq;
  });
  test(`${packageName} - should call custom apiUrl`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://custom.api.flows.com/v2/sdk/blocks" &&
        (headers["x-flows-version"] ?? "").startsWith("@flows/") &&
        body.organizationId === "orgId" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.userProperties.email === "test@flows.sh" &&
        body.userProperties.age === 10 &&
        body.locale === "en-US"
      );
    });
    const urlParams = new URLSearchParams();
    urlParams.set("apiUrl", "https://custom.api.flows.com");
    urlParams.set("locale", "en-US");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
  test(`${packageName} - should call with detected locale`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      const headers = req.headers();
      return (
        req.url() === "https://custom.api.flows.com/v2/sdk/blocks" &&
        (headers["x-flows-version"] ?? "").startsWith("@flows/") &&
        body.locale === "en-US"
      );
    });
    const urlParams = new URLSearchParams();
    urlParams.set("apiUrl", "https://custom.api.flows.com");
    urlParams.set("locale", "automatic");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
};

run("js");
run("react");
