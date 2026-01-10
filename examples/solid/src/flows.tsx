import { onMount } from "solid-js";
import { customElement } from "solid-element";

import { init } from "@flows/js";
import { setupJsComponents } from "@flows/js-components";

import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";

// Don't forget to import the CSS styles for Flows components
import "@flows/js-components/index.css";

import { Banner as SolidBanner } from "~/components/banner";
import { TourBanner as SolidTourBanner } from "~/components/tour-banner";

export const Flows = () => {
  onMount(() => {
    init({
      organizationId: "YOUR_ORGANIZATION_ID",
      userId: "YOUR_USER_ID",
      environment: "production",
    });

    const Banner = customElement(
      "flows-banner",
      {
        // Define prop keys with default values
        title: "",
        body: "",
        close: () => {},
        __flows: { id: "", workflowId: "" },
      },
      SolidBanner,
    );
    const TourBanner = customElement(
      "flows-tour-banner",
      {
        // Define prop keys with default values
        title: "",
        body: "",
        previous: () => {},
        continue: () => {},
        cancel: () => {},
        __flows: { id: "", workflowId: "" },
      },
      SolidTourBanner,
    );

    setupJsComponents({
      components: {
        ...components,
        // Example of custom "Banner" component
        Banner,
      },
      tourComponents: {
        ...tourComponents,
        // Example of custom "Banner" component for tours
        Banner: TourBanner,
      },
    });
  });

  return <flows-floating-blocks />;
};
