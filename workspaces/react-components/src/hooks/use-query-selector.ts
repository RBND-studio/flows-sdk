import { useState, useEffect } from "react";

/**
 * React hook that queries the DOM for an element and updates when the element
 * is added to or removed from the DOM.
 *
 * @param selector - CSS selector string to query the DOM
 * @returns The found DOM element or null if not found
 */
export function useQuerySelector<T extends Element>(selector?: string | null): T | null {
  const [element, setElement] = useState<T | null>(
    // Initial state
    selector ? document.querySelector<T>(selector) : null,
  );

  useEffect(() => {
    if (!selector) {
      setElement(null);
      return;
    }

    // Function to update the element reference
    const updateElement = (): void => {
      const foundElement = document.querySelector<T>(selector);
      setElement((prev) => (prev !== foundElement ? foundElement : prev));
    };

    // Initial query
    updateElement();

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check if we need to re-query
      const shouldRequery = mutations.some(
        (mutation) => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0,
      );

      if (shouldRequery) {
        updateElement();
      }
    });

    // Start observing the document for changes
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [selector]);

  return element;
}
