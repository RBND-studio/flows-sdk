import test, { expect } from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import { Block } from "@flows/shared";
import { randomUUID } from "crypto";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({
  title,
  linkLabel,
  linkUrl,
}: {
  title: string;
  linkLabel: string;
  linkUrl: string;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: {
    title,
  },
  exitNodes: [],
  slottable: false,
  propertyMeta: [
    {
      key: "primaryButton",
      type: "action",
      value: {
        label: linkLabel,
        url: linkUrl,
      },
    },
  ],
});

const run = (packageName: string) => {
  test(`${packageName} - should replace with empty strings`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        title: "Hello {{ wrong_email }}, you are {{ wrong_age }} years old.",
        linkLabel: "Continue {{ wrong_email }}.",
        linkUrl: "https://example.com/{{wrong_email}}/profile",
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Hello , you are  years old.", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue ." })).toHaveAttribute(
      "href",
      "https://example.com//profile",
    );
  });
  test(`${packageName} - should fill with default value`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        title: "Hello {{ wrong_email | john@doe.com }}, you are {{ wrong_age | 30 }} years old.",
        linkLabel: "Continue {{ wrong_email | john@doe.com }}.",
        linkUrl: "https://example.com/{{wrong_email|john@doe.com}}/profile",
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(
      page.getByText("Hello john@doe.com, you are 30 years old.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue john@doe.com." })).toHaveAttribute(
      "href",
      "https://example.com/john@doe.com/profile",
    );
  });
  test(`${packageName} - should fill with user properties`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        title: "Hello {{ email }}, you are {{ age }} years old.",
        linkLabel: "Continue {{ email }}.",
        linkUrl: "https://example.com/{{email}}/profile",
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(
      page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
      "href",
      "https://example.com/test@flows.sh/profile",
    );
  });
  test(`${packageName} - should prioritize user properties over default value`, async ({
    page,
  }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        title: "Hello {{ email | john@doe.com }}, you are {{ age | 30 }} years old.",
        linkLabel: "Continue {{ email | john@doe.com }}.",
        linkUrl: "https://example.com/{{email|john@doe.com}}/profile",
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(
      page.getByText("Hello test@flows.sh, you are 10 years old.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue test@flows.sh." })).toHaveAttribute(
      "href",
      "https://example.com/test@flows.sh/profile",
    );
  });
};

run("js");
run("react");
