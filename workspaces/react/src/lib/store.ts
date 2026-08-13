import type { CustomFetch } from "@flows/shared";

interface GlobalConfig {
  userId: string | null;
  signature?: string;
  organizationId: string;
  environment: string;
  apiUrl: string;
  customFetch?: CustomFetch;
}

export const globalConfig: Partial<GlobalConfig> = {};
