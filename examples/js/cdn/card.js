/**
 * Custom Card component definition
 * @param {{ text: string, continue: () => void }} props
 * @returns {{ element: HTMLElement, cleanup: () => void }}
 */
export const Card = (props) => {
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
