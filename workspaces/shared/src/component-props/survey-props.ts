import { createComponentProps } from "./component-props";
import { template } from "../template";
import type { Block, ComponentProps, SurveyComponentProps, UserProperties } from "../types";
import type { QuestionState } from "./survey-state";
import { SurveyState } from "./survey-state";
import type { ExitNodeCb, SetStateMemory, SubmitSurvey } from "./component-props-types";
import type { ApiSurveyQuestionAnswer } from "../types/api-survey";
import type {
  QuestionBase,
  RatingDisplayType,
  Survey,
  SurveyQuestion,
  SurveyQuestionType,
} from "../types/survey";
import { shuffle } from "es-toolkit";

const shuffleArray = <T>(options: T[], doShuffle?: boolean): T[] => {
  if (!doShuffle) return options;
  return shuffle(options);
};

export const createSurveyComponentProps = (props: {
  block: Block;
  removeBlock: (blockId: string) => void;
  exitNodeCb: ExitNodeCb;
  setStateMemory: SetStateMemory;
  userProperties: UserProperties;
  submitSurvey: SubmitSurvey;
}): SurveyComponentProps<object> | null => {
  const { block } = props;

  const survey = block.survey;
  if (!survey) return null;

  const baseProps = createComponentProps(props) as ComponentProps<{
    cancel: () => void;
    complete: () => void;
  }>;

  const handleSubmit = async (): Promise<void> => {
    const surveyState = SurveyState.getInstance(survey.id);

    await props.submitSurvey({
      surveyId: survey.id,
      submitType: "submit",
      questions: Object.entries(surveyState).map(
        ([questionId, questionState]): ApiSurveyQuestionAnswer => {
          return {
            questionId,
            clickedLink: questionState.clickedLink,
            otherSelected: questionState.otherSelected,
            textResponse: questionState.textResponse,
            optionIds: questionState.optionIds,
          };
        },
      ),
    });

    SurveyState.deleteInstance(survey.id);
  };

  const surveyState = SurveyState.getInstance(survey.id);
  surveyState.questionsLength = survey.questions.length;

  const questions = survey.questions.map((question): SurveyQuestion | null => {
    const questionBase: QuestionBase<SurveyQuestionType> = {
      id: question.id,
      title: template(question.title, props.userProperties),
      description: template(question.description, props.userProperties),
      type: question.type as SurveyQuestionType,
      optional: question.optional,
    };

    if (questionBase.type === "freeform") {
      return {
        ...questionBase,
        type: "freeform",
        placeholder: template(question.textPlaceholder ?? "", props.userProperties),
        setValue: (value) => surveyState.updateQuestion(question.id, { textResponse: value }),
        getValue: () => surveyState.getQuestionValue(question.id),
      };
    }
    if (questionBase.type === "rating") {
      return {
        ...questionBase,
        type: "rating",
        displayType: question.displayType as RatingDisplayType,
        scale: question.scale ?? 5,
        lowerBoundLabel: template(question.lowerBoundLabel ?? "", props.userProperties),
        upperBoundLabel: template(question.upperBoundLabel ?? "", props.userProperties),
        setValue: (value) => surveyState.updateQuestion(question.id, { textResponse: value }),
        getValue: () => surveyState.getQuestionValue(question.id),
      };
    }
    if (questionBase.type === "single-choice") {
      return {
        ...questionBase,
        type: "single-choice",
        otherOption: question.otherOption ?? false,
        otherLabel: template(question.otherLabel ?? "", props.userProperties),

        options: shuffleArray(question.options ?? [], question.shuffleOptions ?? false).map(
          (option) => ({
            id: option.id,
            label: template(option.label, props.userProperties),
          }),
        ),
        getSelectedOptionIds: () => surveyState.getQuestionOptionIds(question.id),
        setSelectedOptionIds: (optionIds) =>
          surveyState.updateQuestion(question.id, {
            optionIds: optionIds,
            otherSelected: false,
            textResponse: undefined,
          }),
        setValue: (value) => surveyState.updateQuestion(question.id, { textResponse: value }),
        getValue: () => surveyState.getQuestionValue(question.id),
        setOtherSelected: (selected) => {
          const update: Partial<QuestionState> = { otherSelected: selected, optionIds: [] };
          if (!selected) update.textResponse = undefined;
          surveyState.updateQuestion(question.id, update);
        },
        getOtherSelected: () => surveyState.getOtherSelected(question.id),
      };
    }
    if (questionBase.type === "multiple-choice") {
      return {
        ...questionBase,
        type: "multiple-choice",
        otherOption: question.otherOption ?? false,
        otherLabel: template(question.otherLabel ?? "", props.userProperties),

        options: shuffleArray(question.options ?? [], question.shuffleOptions ?? false).map(
          (option) => ({
            id: option.id,
            label: template(option.label, props.userProperties),
          }),
        ),
        getSelectedOptionIds: () => surveyState.getQuestionOptionIds(question.id),
        setSelectedOptionIds: (optionIds) =>
          surveyState.updateQuestion(question.id, {
            optionIds: optionIds,
          }),
        getValue: () => surveyState.getQuestionValue(question.id),
        setValue: (value) => surveyState.updateQuestion(question.id, { textResponse: value }),
        setOtherSelected: (selected) => {
          const update: Partial<QuestionState> = { otherSelected: selected };
          if (!selected) update.textResponse = undefined;
          surveyState.updateQuestion(question.id, update);
        },
        getOtherSelected: () => surveyState.getOtherSelected(question.id),
      };
    }
    if (questionBase.type === "link") {
      return {
        ...questionBase,
        type: "link",
        url: template(question.url ?? "", props.userProperties),
        openInNew: question.openInNew ?? false,
        linkLabel: template(question.linkLabel ?? "", props.userProperties),
        setClicked: () => surveyState.updateQuestion(question.id, { clickedLink: true }),
      };
    }
    if (questionBase.type === "end-screen") {
      return {
        ...questionBase,
        type: "end-screen",
        url: template(question.url ?? "", props.userProperties),
        openInNew: question.openInNew ?? false,
        linkLabel: template(question.linkLabel ?? "", props.userProperties),
      };
    }

    return null;
  });

  const surveyProp: Survey = {
    questions: questions.filter((q): q is SurveyQuestion => q !== null),
    getCurrentQuestionIndex: () => surveyState.questionIndex,
    nextQuestion: surveyState.nextQuestion.bind(surveyState),
    previousQuestion: surveyState.previousQuestion.bind(surveyState),
    submit: handleSubmit,
  };

  return {
    ...baseProps,
    survey: surveyProp,
  };
};
