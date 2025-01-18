import { handleTourDocumentClick } from "./tour";

export const handleDocumentClick = (event: MouseEvent): void => {
  const eventTarget = event.target;
  if (!eventTarget || !(eventTarget instanceof Element)) return;

  handleTourDocumentClick(eventTarget);
};
