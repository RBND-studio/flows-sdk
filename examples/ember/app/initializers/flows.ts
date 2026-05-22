import { init } from "@flows/js";
import { setupJsComponents } from "@flows/js-components";

import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";
import * as surveyComponents from "@flows/js-components/survey-components";

// Don't forget to import the CSS styles for Flows components
import "@flows/js-components/index.css";

// Helper empty custom component to get rid of console errors when @flows/js-components tries to render component that is not defined
class NoopComponent extends HTMLElement {}

export function initialize() {
  init({
    organizationId: "2d646d66-2543-42a1-914d-69584e73ed42",
    userId: "ember-user",
    environment: "production",
  });
  setupJsComponents({
    components: {
      ...components,
      // We're rendering custom Banner component in the FlowsFloatingBlocks Ember component, so we need to provide a fallback for it to avoid console errors.
      Banner: NoopComponent,
    },
    tourComponents: {
      ...tourComponents,
      // We're rendering custom Banner tourComponent in the FlowsFloatingBlocks Ember component, so we need to provide a fallback for it to avoid console errors.
      Banner: NoopComponent,
    },
    surveyComponents: {
      ...surveyComponents,
    },
  });
}

export default {
  initialize,
};
