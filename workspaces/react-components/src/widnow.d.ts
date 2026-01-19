import { type LinkComponentProps } from "@flows/shared";
import { type FC } from "react";

declare global {
  interface Window {
    __flows_LinkComponent?: FC<LinkComponentProps>;
  }
}
