import { createBoundApi } from "@flows/shared";
import { packageAndVersion } from "./constants";
import { globalConfig } from "./store";

export const api = createBoundApi(() => {
  const { apiUrl, environment, organizationId, userId, signature, customFetch } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId || signature === null) return null;
  return {
    apiUrl,
    version: packageAndVersion,
    customFetch,
    environment,
    organizationId,
    userId,
    signature,
  };
});
