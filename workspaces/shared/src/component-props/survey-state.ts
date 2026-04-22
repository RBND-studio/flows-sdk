import { debounce } from "es-toolkit";

export type QuestionState = {
  textResponse?: string;
  optionIds?: string[];
  otherSelected?: boolean;
  clickedLink?: boolean;
};
type PersistedSurveyState = {
  questionIndex: number;
  questions: Record<string, QuestionState>;
};

export class SurveyState {
  surveyId: string;
  questionsLength = 0;

  questionIndex = 0;
  questions: { [questionId: string]: QuestionState } = {};

  constructor(surveyId: string) {
    this.surveyId = surveyId;
    SurveyState.instancesBySurveyId.set(surveyId, this);
  }

  updateQuestion(questionId: string, update: Partial<QuestionState>): void {
    const questionState = this.questions[questionId] ?? {};
    this.questions[questionId] = { ...questionState, ...update };
    this.save();
  }
  getQuestion(questionId: string): QuestionState {
    return this.questions[questionId] ?? {};
  }
  getQuestionValue(questionId: string): string | undefined {
    return this.getQuestion(questionId).textResponse;
  }
  getOtherSelected(questionId: string): boolean {
    return this.getQuestion(questionId).otherSelected ?? false;
  }
  getQuestionOptionIds(questionId: string): string[] {
    return this.getQuestion(questionId).optionIds ?? [];
  }

  nextQuestion(): number {
    if (this.questionIndex < this.questionsLength - 1) {
      this.questionIndex += 1;
      this.save(true);
    }
    return this.questionIndex;
  }
  previousQuestion(): number {
    if (this.questionIndex > 0) {
      this.questionIndex -= 1;
      this.save(true);
    }
    return this.questionIndex;
  }

  static getSessionStorageKey(surveyId: string): string {
    return `flows-survey-state-${surveyId}`;
  }
  saveToSessionStorage(): void {
    const data: PersistedSurveyState = {
      questionIndex: this.questionIndex,
      questions: this.questions,
    };
    sessionStorage.setItem(SurveyState.getSessionStorageKey(this.surveyId), JSON.stringify(data));
  }
  debouncedSaveToSessionStorage = debounce(this.saveToSessionStorage.bind(this), 500);
  save(immediate = false): void {
    this.debouncedSaveToSessionStorage();
    if (immediate) {
      this.debouncedSaveToSessionStorage.flush();
    }
  }

  static instancesBySurveyId: Map<string, SurveyState> = new Map();
  static getInstance(surveyId: string): SurveyState {
    const existing = SurveyState.instancesBySurveyId.get(surveyId);
    if (existing) return existing;

    const persistedState = sessionStorage.getItem(SurveyState.getSessionStorageKey(surveyId));
    try {
      if (!persistedState) throw new Error();
      const parsedState = JSON.parse(persistedState) as PersistedSurveyState;
      const manager = new SurveyState(surveyId);
      manager.questionIndex = parsedState.questionIndex;
      manager.questions = parsedState.questions;
      return manager;
    } catch {
      return new SurveyState(surveyId);
    }
  }
  deleteInstance(): void {
    this.debouncedSaveToSessionStorage.cancel();
    SurveyState.instancesBySurveyId.delete(this.surveyId);
    sessionStorage.removeItem(SurveyState.getSessionStorageKey(this.surveyId));
  }
}
