import { defineNuxtPlugin } from "nuxt/app";
import { defineCustomElement } from "vue";

import { init } from "@flows/js";
import { setupJsComponents } from "@flows/js-components";
import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";
import "@flows/js-components/index.css";

import VueBanner from "~/components/banner.vue";
import VueTourBanner from "~/components/tour-banner.vue";

const Banner = defineCustomElement(VueBanner);
const TourBanner = defineCustomElement(VueTourBanner);

export default defineNuxtPlugin({
  name: "flows",
  parallel: true,
  hooks: {
    "app:mounted"() {
      init({
        organizationId: "9fc72ef7-2978-4f74-86fc-75a608c39728",
        environment: "production",
        userId: "vue-user",
      });
      setupJsComponents({
        components: {
          ...components,
          // Example of custom "Banner" component
          Banner: Banner as any,
        },
        tourComponents: {
          ...tourComponents,
          // Example of custom "Banner" component for tours
          Banner: TourBanner as any,
        },
      });
    },
  },
});
