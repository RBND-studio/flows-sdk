import { type LanguageOption, type UserProperties } from "@flows/shared";

export interface FlowsOptions {
  /**
   * Your organization ID. Find this in Settings \> General.
   */
  organizationId: string;
  /**
   * The environment key. Find this in Settings \> Environments.
   */
  environment: string;
  /**
   * Unique ID used to identify the user.
   */
  userId: string;
  /**
   * Object with custom [user properties](https://flows.sh/docs/users/properties). Values can be string, number, boolean, or date.
   */
  userProperties?: UserProperties;
  /**
   * Custom API URL useful when using proxy to send Flows requests through your own domain.
   */
  apiUrl?: string;
  /**
   * Locale used to select the correct translation for the block data.
   * - `disabled` - the default language will be served. (default)
   * - `automatic` - the locale will be detected from the browser settings.
   * - specific locale (e.g. `en`, `en-US`) - The whole list of supported locales can be found: TODO:
   * @defaultValue `disabled`
   */
  language?: LanguageOption;
}
