// @flows/js
const { init, addFloatingBlocksChangeListener, addSlotBlocksChangeListener } = flows_js;

// @flows/js-components
const { render, updateSlotComponents } = flows_js_components;
const providedComponents = flows_js_components_components;
const providedTourComponents = flows_js_components_tour_components;

/**
 * Custom Card component definition
 * @param {{ text: string, continue: () => void }} props
 * @returns {{ element: HTMLElement, cleanup: () => void }}
 */
const Card = (props) => {
  const card = document.createElement("div");

  const text = document.createElement("p");
  text.innerText = props.text;
  card.appendChild(text);

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.addEventListener("click", props.close);
  card.appendChild(closeButton);

  return {
    element: card,
    cleanup: () => {
      closeButton.removeEventListener("click", props.close);
    },
  };
};

// Define your components, we're using pre-built components and a custom Card component
const components = { ...providedComponents, Card };
// We're not providing custom components for the tour but you can add any components you want.
const tourComponents = { ...providedTourComponents };

// Initialize the SDK with your options
init({
  organizationId: "YOUR_ORGANIZATION_ID",
  userId: "YOUR_USER_ID",
  environment: "production",
});
// Setup <flows-slot>
updateSlotComponents({
  components,
  tourComponents,
  addSlotBlocksChangeListener,
});
// Setup rendering of floating blocks
addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });
});
