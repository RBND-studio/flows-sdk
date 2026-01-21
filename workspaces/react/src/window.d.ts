import { type LinkComponentType } from "@flows/shared";

declare global {
  interface Window {
    __flows_LinkComponent?: LinkComponentType;
  }
}
