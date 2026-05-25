import { type NavigationHandler } from "@flows/shared";

declare global {
  interface Window {
    __flows_onNavigate?: OnNavigate;
  }
}
