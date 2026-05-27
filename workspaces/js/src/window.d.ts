import { type OnNavigate } from "@flows/shared";

declare global {
  interface Window {
    __flows_onNavigate?: OnNavigate;
  }
}
