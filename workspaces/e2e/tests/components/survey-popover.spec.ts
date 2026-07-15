import type { Block } from "@flows/shared";
import test, { expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "../utils";

const getBlock = (): Block => ({
  id: randomUUID(),
  blockStateId: randomUUID(),
  workflowId: randomUUID(),
  type: "survey",
  componentType: "BasicsV2SurveyPopover",
  data: {},
  exitNodes: ["complete", "cancel"],
  slottable: false,
  survey: {
    id: randomUUID(),
    questions: [
      {
        id: randomUUID(),
        type: "rating",
        title: "How would you rate your experience?",
        description: "",
        optional: false,
      },
    ],
  },
});

const run = (packageName: string) => {
  test(`${packageName} - should show branding with free org`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getBlock()], true);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_survey_popover_branding")).toBeVisible();
    await mockBlocksEndpoint(page, [getBlock()], false);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_survey_popover_branding")).toBeHidden();
  });
};

run("react");
run("js");
