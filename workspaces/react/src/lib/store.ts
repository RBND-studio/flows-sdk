import type { CustomFetch } from "@flows/shared";

interface GlobalConfig {
  userId: string;
  organizationId: string;
  environment: string;
  apiUrl: string;
  customFetch?: CustomFetch;
}

export const globalConfig: Partial<GlobalConfig> = {};
