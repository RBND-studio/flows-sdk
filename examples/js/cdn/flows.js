// @flows/js
const {
  init,
  addFloatingBlocksChangeListener,
  addSlotBlocksChangeListener,
  getCurrentFloatingBlocks,
  getCurrentSlotBlocks,
} = flows_js;

// @flows/js-components
const { setupJsComponents } = flows_js_components;
const components = flows_js_components_components;
const tourComponents = flows_js_components_tour_components;

import { Banner } from "./banner.js";
import { TourBanner } from "./tour-banner.js";

// Initialize the SDK with your options
init({
  organizationId: "YOUR_ORGANIZATION_ID",
  userId: "YOUR_USER_ID",
  environment: "production",
});
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

  // We need to pass @flows/js methods to fix non working cross package imports in CDN setup
  addFloatingBlocksChangeListener,
  addSlotBlocksChangeListener,
  getCurrentFloatingBlocks,
  getCurrentSlotBlocks,
});
