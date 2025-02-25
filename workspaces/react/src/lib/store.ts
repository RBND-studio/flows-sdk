interface GlobalConfig {
  userId: string;
  organizationId: string;
  environment: string;
  apiUrl: string;
}

export const globalConfig: Partial<GlobalConfig> = {};
