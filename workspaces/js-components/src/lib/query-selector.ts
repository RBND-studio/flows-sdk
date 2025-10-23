export function observeQuerySelector<T extends Element>(
  selector: string | null,
  cb: (element: T | null) => void,
): () => void {
  const publishChange = (): void => {
    const element = selector ? document.querySelector<T>(selector) : null;
    cb(element);
  };

  // Create a MutationObserver to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    // Check if we need to re-query
    const shouldRequery = mutations.some(
      (mutation) => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0,
    );

    if (shouldRequery) {
      publishChange();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  publishChange();

  return () => {
    observer.disconnect();
  };
}
