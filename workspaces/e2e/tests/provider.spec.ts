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
  test(`${packageName} - shouldn't initialize without user id`, async ({ page }) => {
    await page.goto(`/${packageName}.html?noUserId=true`);

    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url() === "https://api.flows-cloud.com/v2/sdk/blocks") reqWasSent = true;
    });

    await new Promise((res) => setTimeout(res, 500));

    expect(reqWasSent).toBe(false);
  });
  test(`${packageName} - should initialize with user id`, async ({ page }) => {
    await page.goto(`/${packageName}.html`);

    let reqWasSent = false;
    page.on("request", (req) => {
      if (req.url() === "https://api.flows-cloud.com/v2/sdk/blocks") reqWasSent = true;
    });

    await new Promise((res) => setTimeout(res, 500));

    await expect(() => expect(reqWasSent).toBe(true)).toPass();
  });
};

run("react");
