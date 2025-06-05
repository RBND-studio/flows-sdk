import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const run = (packageName: string, language: string) => {
  test(`${packageName} (${language}) - should call custom apiUrl`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" && body.language === "en-GB";
    });
    const urlParams = new URLSearchParams();
    urlParams.set("language", "en-GB");
    await page.goto(`/${packageName}.html?${urlParams.toString()}`);
    await blocksReq;
  });
  test(`${packageName} (${language}) - should call with detected language`, async ({ page }) => {
    await page.route("**/v2/sdk/blocks", (route) => {
      route.fulfill({ json: { blocks: [] } });
    });
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" && body.language === language
      );
    });
    const urlParams = new URLSearchParams();
    urlParams.set("language", "automatic");
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
