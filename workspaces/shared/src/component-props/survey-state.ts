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
  blockStateId: string;
  questionsLength = 0;

  questionIndex = 0;
  questions: { [questionId: string]: QuestionState } = {};

  private constructor(blockStateId: string) {
    this.blockStateId = blockStateId;
    SurveyState.instancesByBlockStateId.set(blockStateId, this);
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

  static getSessionStorageKey(blockStateId: string): string {
    return `flows-survey-state-${blockStateId}`;
  }
  saveToSessionStorage(): void {
    const data: PersistedSurveyState = {
      questionIndex: this.questionIndex,
      questions: this.questions,
    };
    sessionStorage.setItem(
      SurveyState.getSessionStorageKey(this.blockStateId),
      JSON.stringify(data),
    );
  }
  debouncedSaveToSessionStorage = debounce(this.saveToSessionStorage.bind(this), 500);
  save(immediate = false): void {
    this.debouncedSaveToSessionStorage();
    if (immediate) {
      this.debouncedSaveToSessionStorage.flush();
    }
  }

  static instancesByBlockStateId: Map<string, SurveyState> = new Map();
  static getInstance(
    blockStateId: string,
    context: {
      questionsLength: number;
    },
  ): SurveyState {
    const existingState = SurveyState.instancesByBlockStateId.get(blockStateId);
    if (existingState) {
      existingState.questionsLength = context.questionsLength;
      return existingState;
    }

    const persistedState = sessionStorage.getItem(SurveyState.getSessionStorageKey(blockStateId));
    try {
      if (!persistedState) throw new Error();
      const parsedState = JSON.parse(persistedState) as PersistedSurveyState;
      const savedState = new SurveyState(blockStateId);
      savedState.questionIndex = parsedState.questionIndex;
      savedState.questions = parsedState.questions;
      savedState.questionsLength = context.questionsLength;
      return savedState;
    } catch {
      const newState = new SurveyState(blockStateId);
      newState.questionsLength = context.questionsLength;
      return newState;
    }
  }
  deleteInstance(): void {
    this.debouncedSaveToSessionStorage.cancel();
    SurveyState.instancesByBlockStateId.delete(this.blockStateId);
    sessionStorage.removeItem(SurveyState.getSessionStorageKey(this.blockStateId));
  }
}
