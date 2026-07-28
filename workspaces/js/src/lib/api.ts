import { createBoundApi } from "@flows/shared";
import { packageAndVersion } from "./constants";
import { config } from "../store";

export const api = createBoundApi(() => {
  const configuration = config.value;
  if (!configuration) return null;
  const { apiUrl, environment, organizationId, userId, customFetch } = configuration;
  if (!apiUrl || !environment || !organizationId || !userId) return null;
  return { apiUrl, version: packageAndVersion, customFetch, environment, organizationId, userId };
});
