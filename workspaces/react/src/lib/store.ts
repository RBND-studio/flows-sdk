import type { ApiFactory } from "@flows/shared";

interface GlobalConfig {
  userId: string;
  organizationId: string;
  environment: string;
  apiUrl: string;
  apiFactory?: ApiFactory;
}

export const globalConfig: Partial<GlobalConfig> = {};
