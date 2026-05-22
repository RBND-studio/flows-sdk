export type Component = CustomElementConstructor | typeof HTMLElement;
export type TourComponent = CustomElementConstructor | typeof HTMLElement;
export type SurveyComponent = CustomElementConstructor | typeof HTMLElement;

export type Components = Record<string, Component>;
export type TourComponents = Record<string, TourComponent>;
export type SurveyComponents = Record<string, SurveyComponent>;
