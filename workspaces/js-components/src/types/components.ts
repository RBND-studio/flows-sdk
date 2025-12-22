export type Component = CustomElementConstructor | typeof HTMLElement;
export type TourComponent = CustomElementConstructor | typeof HTMLElement;

export type Components = Record<string, Component>;
export type TourComponents = Record<string, TourComponent>;
