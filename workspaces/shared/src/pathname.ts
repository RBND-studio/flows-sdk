export const getPathname = (): string => window.location.pathname + window.location.search;

export const isInternalLink = (href: string, target?: "_blank"): boolean => {
  if (target === "_blank") return false;
  try {
    const _url = new URL(href);
    return false;
  } catch {
    return true;
  }
};
