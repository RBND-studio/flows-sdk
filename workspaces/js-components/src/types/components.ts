import { type LitElement } from "lit";

export type Component = typeof LitElement;
export type TourComponent = typeof LitElement;

export type Components = Record<string, Component>;
export type TourComponents = Record<string, TourComponent>;
