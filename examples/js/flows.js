const { init, addFloatingBlocksChangeListener } = flows_js;
const { render, updateSlotComponents } = flows_js_components;
const components = flows_js_components_components;
const tourComponents = flows_js_components_tour_components;

init({
  organizationId: "YOUR_ORGANIZATION_ID",
  userId: "YOUR_USER_ID",
  environment: "production",
});

updateSlotComponents({ components, tourComponents });
addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });
});
