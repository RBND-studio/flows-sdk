import { type UserProperties } from "@flows/shared";

export interface FlowsConfiguration {
  organizationId: string;
  environment: string;
  userId: string;
  userProperties?: UserProperties;
  apiUrl?: string;
}
