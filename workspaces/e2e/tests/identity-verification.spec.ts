import test from "@playwright/test";
import { mockBlocksEndpoint } from "./utils";
import { randomUUID } from "crypto";
import type { Block } from "@flows/shared";

const getModal = (): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "component",
  componentType: "BasicsV2Modal",
  data: { title: "Hello world", body: "" },
  exitNodes: ["continue"],
  slottable: false,
  propertyMeta: [
    {
      type: "action",
      key: "primaryButton",
      value: { label: "Modal continue", exitNode: "continue" },
    },
  ],
});

const getSurvey = (): Block => ({
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
        optional: true,
      },
    ],
  },
});

const run = (packageName: string) => {
  test(`${packageName} - it should add signature to requests`, async ({ page }) => {
    await mockBlocksEndpoint(page, [getModal(), getSurvey()]);

    const signature = "my-signature";
    const blocksReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/blocks" && body.signature === signature
      );
    });
    await page.goto(`/${packageName}.html?signature=${signature}`);
    await blocksReq;

    const eventReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/events" && body.signature === signature
      );
    });
    await page.getByText("Modal continue", { exact: true }).click();
    await eventReq;

    const surveyReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/survey" && body.signature === signature
      );
    });
    await page.getByText("Submit", { exact: true }).click();
    await surveyReq;

    const workflowsReq = page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/workflows" && body.signature === signature
      );
    });
    await page.getByText("fetchWorkflows", { exact: true }).click();
    await workflowsReq;
  });
};

run("js");
run("react");
