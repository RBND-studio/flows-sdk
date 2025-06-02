import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const run = (packageName: string, locale: string) => {
  test(`${packageName} (${locale}) - should call custom apiUrl`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" && body.locale === "en-GB";
    });
    const urlParams = new URLSearchParams();
    urlParams.set("locale", "en-GB");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
  test(`${packageName} (${locale}) - should call with detected locale`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" && body.locale === locale;
    });
    const urlParams = new URLSearchParams();
    urlParams.set("locale", "automatic");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
};

test.describe("en-US", () => {
  test.use({ locale: "en-US" });
  run("js", "en-US");
  run("react", "en-US");
});

test.describe("fr-FR", () => {
  test.use({ locale: "fr-FR" });
  run("js", "fr-FR");
  run("react", "fr-FR");
});
