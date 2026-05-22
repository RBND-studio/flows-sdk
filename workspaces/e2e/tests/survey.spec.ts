import type { Block } from "@flows/shared";
import test, { expect, type Page } from "@playwright/test";
import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "crypto";
import { mockBlocksEndpoint } from "./utils";
import type { ApiSurveyQuestion, ApiSurveyQuestionAnswer } from "@flows/shared";

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(
    (url) => url.pathname === "/ws/sdk/block-updates",
    () => {},
  );
});

const getBlock = ({
  questions,
  autoCloseAfterSubmit,
  autoProceedAfterAnswer,
  dismissible,
  nextButtonLabel,
  submitButtonLabel,
}: {
  questions: ApiSurveyQuestion[];
  dismissible?: boolean;
  autoCloseAfterSubmit?: boolean;
  autoProceedAfterAnswer?: boolean;
  nextButtonLabel?: string;
  submitButtonLabel?: string;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  type: "survey",
  componentType: "BasicsV2SurveyPopover",
  data: {
    autoCloseAfterSubmit,
    autoProceedAfterAnswer,
    dismissible,
    nextButtonLabel,
    submitButtonLabel,
  },
  exitNodes: ["complete", "cancel"],
  slottable: false,
  survey: { id: randomUUID(), blockStateId: randomUUID(), questions },
});

const run = (packageName: string) => {
  const waitForSurveySubmit = ({
    page,
    block,
    questions,
    urlMatcher = (url) => url === `http://localhost:3000/${packageName}.html`,
  }: {
    page: Page;
    block: Block;
    questions: ApiSurveyQuestionAnswer[];
    urlMatcher?: (url: string) => boolean;
  }) =>
    page.waitForRequest((req) => {
      const body = req.postDataJSON();
      return (
        req.url() === "https://api.flows-cloud.com/v2/sdk/survey" &&
        body.userId === "testUserId" &&
        body.environment === "prod" &&
        body.organizationId === "orgId" &&
        body.surveyId === block.survey?.id &&
        body.blockStateId === block.survey?.blockStateId &&
        urlMatcher(body.url) &&
        isDeepStrictEqual(body.questions, questions)
      );
    });

  test(`${packageName} - question header and survey options`, async ({ page }) => {
    await mockBlocksEndpoint(page, [
      getBlock({
        dismissible: true,
        submitButtonLabel: "My submit",
        nextButtonLabel: "My next",
        questions: [
          {
            id: "1",
            type: "freeform",
            title: "My question",
            description: "My description",
            optional: true,
          },
          {
            id: "2",
            type: "freeform",
            title: "Another question",
            description: "Another description",
            optional: true,
          },
        ],
      }),
    ]);
    await page.goto(`/${packageName}.html`);
    await expect(page.locator(".flows_basicsV2_survey_popover")).toBeVisible();
    await expect(page.getByText("My question", { exact: true })).toBeVisible();
    await expect(page.getByText("My description", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_basicsV2_survey_popover_close")).toBeVisible();
    await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toHaveText("My next");
    await page.locator(".flows_basicsV2_survey_popover_submit").click();

    await expect(page.getByText("Another question", { exact: true })).toBeVisible();
    await expect(page.getByText("Another description", { exact: true })).toBeVisible();
    await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toHaveText("My submit");
  });
  test.describe("Freeform question", () => {
    test(`${packageName} - can be submitted`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Question 1",
            description: "Description 1",
            type: "freeform",
            optional: false,
            textPlaceholder: "PlaceH",
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(
        page.locator(".flows_basicsV2_survey_popover_freeform_textarea"),
      ).toHaveAttribute("placeholder", "PlaceH");
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeDisabled();
      await page.locator(".flows_basicsV2_survey_popover_freeform_textarea").fill("Answer");
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      // Wait for session storage to save the value
      await page.waitForTimeout(500);
      await page.reload();
      await expect(page.locator(".flows_basicsV2_survey_popover_freeform_textarea")).toHaveValue(
        "Answer",
      );
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [{ questionId: "question-1", textResponse: "Answer" }],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
    test(`${packageName} - shouldn't send answer with empty string`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Question 1",
            description: "Description 1",
            type: "freeform",
            optional: true,
            textPlaceholder: "PlaceH",
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      await expect(page.locator(".flows_basicsV2_survey_popover_freeform_textarea")).toHaveValue(
        "",
      );
      const submitReq = waitForSurveySubmit({ page, block, questions: [] });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
  });
  test.describe("Rating question", () => {
    test(`${packageName} - can be submitted`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "How satisfied are you?",
            description: "Choose a rating",
            type: "rating",
            optional: false,
            minValue: 1,
            maxValue: 5,
            displayType: "numbers",
            lowerBoundLabel: "Not at all",
            upperBoundLabel: "Very much",
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.getByText("Not at all", { exact: true })).toBeVisible();
      await expect(page.getByText("Very much", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeDisabled();
      await page.getByRole("radio", { name: "4 out of 5" }).click();
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      await page.waitForTimeout(500);
      await page.reload();
      await expect(page.getByRole("radio", { name: "4 out of 5" })).toHaveAttribute(
        "data-selected",
        "true",
      );
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [{ questionId: "question-1", textResponse: "4" }],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
    test(`${packageName} - shouldn't send unanswered optional rating`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "How satisfied are you?",
            description: "Choose a rating",
            type: "rating",
            optional: true,
            minValue: 1,
            maxValue: 5,
            displayType: "numbers",
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
  });
  test.describe("Single choice question", () => {
    test(`${packageName} - can submit other option`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Choose one",
            description: "Pick the best option",
            type: "single-choice",
            optional: false,
            otherOption: true,
            otherLabel: "Something else",
            options: [
              { id: "option-1", label: "Option 1" },
              { id: "option-2", label: "Option 2" },
            ],
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeDisabled();
      await page.locator(".flows_basicsV2_survey_popover_other_option_button").click();
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeDisabled();
      await page.locator(".flows_basicsV2_survey_popover_other_option_input").fill("Other answer");
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      await page.waitForTimeout(500);
      await page.reload();
      await expect(page.locator(".flows_basicsV2_survey_popover_other_option_input")).toHaveValue(
        "Other answer",
      );
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [
          {
            questionId: "question-1",
            optionIds: [],
            otherSelected: true,
            textResponse: "Other answer",
          },
        ],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
    test(`${packageName} - shouldn't send unanswered optional single choice`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Choose one",
            description: "Pick the best option",
            type: "single-choice",
            optional: true,
            options: [
              { id: "option-1", label: "Option 1" },
              { id: "option-2", label: "Option 2" },
            ],
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
  });
  test.describe("Multiple choice question", () => {
    test(`${packageName} - can submit selected options and other input`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Choose all that apply",
            description: "Pick one or more options",
            type: "multiple-choice",
            optional: false,
            otherOption: true,
            otherLabel: "Something else",
            options: [
              { id: "option-1", label: "Option 1" },
              { id: "option-2", label: "Option 2" },
            ],
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeDisabled();
      await page.getByRole("checkbox", { name: "Option 1" }).click();
      await page.locator(".flows_basicsV2_survey_popover_other_option_button").click();
      await page.locator(".flows_basicsV2_survey_popover_other_option_input").fill("Other answer");
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      await page.waitForTimeout(500);
      await page.reload();
      await expect(page.getByRole("checkbox", { name: "Option 1" })).toHaveAttribute(
        "data-selected",
        "true",
      );
      await expect(page.locator(".flows_basicsV2_survey_popover_other_option_input")).toHaveValue(
        "Other answer",
      );
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [
          {
            questionId: "question-1",
            optionIds: ["option-1"],
            otherSelected: true,
            textResponse: "Other answer",
          },
        ],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
    test(`${packageName} - shouldn't send unanswered optional multiple choice`, async ({
      page,
    }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Choose all that apply",
            description: "Pick one or more options",
            type: "multiple-choice",
            optional: true,
            options: [
              { id: "option-1", label: "Option 1" },
              { id: "option-2", label: "Option 2" },
            ],
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toBeEnabled();
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [],
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
    });
  });
  test.describe("Link question", () => {
    test(`${packageName} - submits clicked link and navigates`, async ({ page }) => {
      const block = getBlock({
        questions: [
          {
            id: "question-1",
            title: "Continue reading",
            description: "Open the linked page",
            type: "link",
            optional: true,
            linkLabel: "Go to another page",
            url: "/another-page",
            openInNew: false,
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html?LinkComponent=true`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toHaveCount(0);
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [{ questionId: "question-1", clickedLink: true }],
        urlMatcher: (url) => url === `http://localhost:3000/${packageName}.html?LinkComponent=true`,
      });
      await page.getByRole("link", { name: "Go to another page" }).click();
      await submitReq;
      if (packageName === "react")
        await expect(page).toHaveURL(`/${packageName}.html?LinkComponent=true#/another-page`);
      if (packageName === "js") await expect(page).toHaveURL(`/another-page`);
    });
    test(`${packageName} - shouldn't send unanswered optional link`, async ({ page }) => {
      const block = getBlock({
        dismissible: true,
        questions: [
          {
            id: "question-1",
            title: "Continue reading",
            description: "Open the linked page",
            type: "link",
            optional: true,
            linkLabel: "Go to another page",
            url: "/another-page",
            openInNew: false,
          },
        ],
      });
      const surveyRequests: unknown[] = [];
      page.on("request", (req) => {
        if (req.url() === "https://api.flows-cloud.com/v2/sdk/survey") {
          surveyRequests.push(req.postDataJSON());
        }
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html?LinkComponent=true`);
      await expect(page.locator(".flows_basicsV2_survey_popover_submit")).toHaveCount(0);
      await page.locator(".flows_basicsV2_survey_popover_close").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".flows_basicsV2_survey_popover")).toHaveCount(0);
      expect(surveyRequests).toEqual([]);
    });
  });
  test.describe("End screen question", () => {
    test(`${packageName} - submits previous answers and renders final CTA`, async ({ page }) => {
      const block = getBlock({
        dismissible: true,
        autoCloseAfterSubmit: false,
        questions: [
          {
            id: "question-1",
            title: "Question 1",
            description: "Description 1",
            type: "freeform",
            optional: false,
            textPlaceholder: "PlaceH",
          },
          {
            id: "question-2",
            title: "All done",
            description: "Thanks for your feedback",
            type: "end-screen",
            optional: true,
            linkLabel: "Back to app",
            url: "/another-page",
            openInNew: false,
          },
        ],
      });
      await mockBlocksEndpoint(page, [block]);
      await page.goto(`/${packageName}.html?LinkComponent=true`);
      await page.locator(".flows_basicsV2_survey_popover_freeform_textarea").fill("Answer");
      const submitReq = waitForSurveySubmit({
        page,
        block,
        questions: [{ questionId: "question-1", textResponse: "Answer" }],
        urlMatcher: (url) =>
          url.startsWith(`http://localhost:3000/${packageName}.html?LinkComponent=true`),
      });
      await page.locator(".flows_basicsV2_survey_popover_submit").click();
      await submitReq;
      await expect(page.getByText("All done", { exact: true })).toBeVisible();
      await expect(page.getByText("Thanks for your feedback", { exact: true })).toBeVisible();
      await expect(page.locator(".flows_basicsV2_survey_popover_close")).toHaveCount(0);
      await page.getByRole("link", { name: "Back to app" }).click();
      if (packageName === "react")
        await expect(page).toHaveURL(`/${packageName}.html?LinkComponent=true#/another-page`);
      if (packageName === "js") await expect(page).toHaveURL(`/another-page`);
    });
  });

  test(`${packageName} - survey persists page`, async ({ page }) => {
    const block = getBlock({
      questions: [
        {
          id: "question-1",
          type: "freeform",
          title: "Question 1",
          description: "Description 1",
          optional: true,
        },
        {
          id: "question-2",
          type: "freeform",
          title: "Question 2",
          description: "Description 2",
          optional: true,
        },
      ],
    });
    await mockBlocksEndpoint(page, [block]);
    await page.goto(`/${packageName}.html`);
    await expect(page.getByText("Question 1", { exact: true })).toBeVisible();
    await page.getByText("Next", { exact: true }).click();
    await expect(page.getByText("Question 2", { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    await page.reload();
    await expect(page.getByText("Question 2", { exact: true })).toBeVisible();
    await expect(page.getByText("Description 2", { exact: true })).toBeVisible();
    await expect(page.getByText("Question 1", { exact: true })).toHaveCount(0);
  });
};

run("react");
run("js");
