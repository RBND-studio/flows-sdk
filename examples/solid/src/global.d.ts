/// <reference types="@solidjs/start/env" />

import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "flows-floating-blocks": JSX.HTMLAttributes<HTMLElement>;
      "flows-slot": { "data-slot-id": string } & JSX.HTMLAttributes<HTMLElement>;
    }
  }
}
