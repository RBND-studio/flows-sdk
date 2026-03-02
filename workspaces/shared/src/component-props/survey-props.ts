import { createComponentProps } from "./component-props";
import { template } from "../template";
import type { Block, ComponentProps, SurveyComponentProps, UserProperties } from "../types";
import {
  getOptionValue,
  getOpenSelected,
  getQuestionValue,
  getSurveyState,
  setClickedLink,
  setOpenSelected,
  setOptionValue,
  setQuestionValue,
} from "./survey-state";
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
    submit: () => void;
  }>;

  const handleSubmit = (): void => {
    baseProps.submit();

    const surveyState = getSurveyState(survey.id);

    void props.submitSurvey({
      surveyId: survey.id,
      submitType: "submit",
      questions: Object.entries(surveyState ?? {}).map(
        ([questionId, questionState]): ApiSurveyQuestionAnswer => {
          return {
            questionId,
            clickedLink: questionState.clickedLink,
            openSelected: questionState.openSelected,
            textResponse: questionState.textResponse,
            optionIds: questionState.optionIds,
          };
        },
      ),
    });
  };

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
        setValue: (value) =>
          setQuestionValue({ questionId: question.id, surveyId: survey.id, value }),
        getInitialValue: () => getQuestionValue(survey.id, question.id),
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
        setValue: (value) =>
          setQuestionValue({ questionId: question.id, surveyId: survey.id, value }),
        getInitialValue: () => getQuestionValue(survey.id, question.id),
      };
    }
    if (questionBase.type === "single-choice") {
      return {
        ...questionBase,
        type: "single-choice",
        openOption: question.openOption ?? false,
        openLabel: template(question.openLabel ?? "", props.userProperties),

        options: shuffleArray(question.options ?? [], question.shuffleOptions ?? false).map(
          (option) => ({
            id: option.id,
            label: template(option.label, props.userProperties),

            setSelected: (selected) =>
              setOptionValue({
                surveyId: survey.id,
                questionId: question.id,
                optionId: option.id,
                selected,
                clearPrevious: true,
              }),
            getInitialSelected: () => getOptionValue(survey.id, question.id, option.id),
          }),
        ),
        setValue: (value) =>
          setQuestionValue({ questionId: question.id, surveyId: survey.id, value }),
        getInitialValue: () => getQuestionValue(survey.id, question.id),
        setOpenSelected: (selected) =>
          setOpenSelected({
            questionId: question.id,
            selected,
            surveyId: survey.id,
            clearOptions: true,
          }),
        getInitialOpenSelected: () => getOpenSelected(survey.id, question.id),
      };
    }
    if (questionBase.type === "multiple-choice") {
      return {
        ...questionBase,
        type: "multiple-choice",
        openOption: question.openOption ?? false,
        openLabel: template(question.openLabel ?? "", props.userProperties),

        options: shuffleArray(question.options ?? [], question.shuffleOptions ?? false).map(
          (option) => ({
            id: option.id,
            label: template(option.label, props.userProperties),

            setSelected: (selected) =>
              setOptionValue({
                surveyId: survey.id,
                questionId: question.id,
                optionId: option.id,
                selected,
                clearPrevious: false,
              }),
            getInitialSelected: () => getOptionValue(survey.id, question.id, option.id),
          }),
        ),
        getInitialValue: () => getQuestionValue(survey.id, question.id),
        setValue: (value) =>
          setQuestionValue({ questionId: question.id, surveyId: survey.id, value }),
        setOpenSelected: (selected) =>
          setOpenSelected({
            questionId: question.id,
            selected,
            surveyId: survey.id,
            clearOptions: false,
          }),
        getInitialOpenSelected: () => getOpenSelected(survey.id, question.id),
      };
    }
    if (questionBase.type === "link") {
      return {
        ...questionBase,
        type: "link",
        url: template(question.url ?? "", props.userProperties),
        openInNew: question.openInNew ?? false,
        linkLabel: template(question.linkLabel ?? "", props.userProperties),
        setClicked: () => setClickedLink({ questionId: question.id, surveyId: survey.id }),
      };
    }

    return null;
  });

  const surveyProp: Survey = {
    questions: questions.filter((q): q is SurveyQuestion => q !== null),
  };

  return {
    ...baseProps,
    submit: handleSubmit,
    survey: surveyProp,
  };
};
