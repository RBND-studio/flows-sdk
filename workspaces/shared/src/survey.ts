const SESSION_STORAGE_KEY = "flows-running-surveys";

export const getSessionStorageRunningSurveys = (): string[] => {
  if (typeof window === "undefined") return [];

  const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!item) return [];

  try {
    const parsedValue = JSON.parse(item);
    if (!Array.isArray(parsedValue) || !parsedValue.every((v) => typeof v === "string")) {
      throw new Error();
    }

    return parsedValue;
  } catch {
    return [];
  }
};

export const saveSessionStorageRunningSurveys = (runningSurveyIds: string[]): void => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(runningSurveyIds));
};
