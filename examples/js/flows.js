const { init, addFloatingBlocksChangeListener, addSlotBlocksChangeListener, getCurrentSlotBlocks } =
  flows_js;
const { render, updateSlotComponents } = flows_js_components;
const providedComponents = flows_js_components_components;
const providedTourComponents = flows_js_components_tour_components;

/**
 * Custom card component
 * @param {{ text: string, continue: () => void }} props
 * @returns
 */
const Card = (props) => {
  const card = document.createElement("div");

  const text = document.createElement("p");
  text.innerText = props.text;
  card.appendChild(text);

  const continueButton = document.createElement("button");
  continueButton.innerText = "Continue";
  continueButton.addEventListener("click", props.continue);
  card.appendChild(continueButton);

  return {
    element: card,
    cleanup: () => {
      continueButton.removeEventListener("click", props.continue);
    },
  };
};

const components = { ...providedComponents, Card };
const tourComponents = { ...providedTourComponents };

init({
  organizationId: "YOUR_ORGANIZATION_ID",
  userId: "YOUR_USER_ID",
  environment: "production",
});

updateSlotComponents({
  components,
  tourComponents,
  addSlotBlocksChangeListener,
});
addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });
});
