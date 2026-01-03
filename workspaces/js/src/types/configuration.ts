import {
  type TemplateUserProperties,
  type LanguageOption,
  type UserProperties,
} from "@flows/shared";

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
   * TODO:
   */
  templateUserProperties?: TemplateUserProperties;
  /**
   * Custom API URL useful when using proxy to send Flows requests through your own domain.
   */
  apiUrl?: string;
  /**
   * Language used to enable [localization](https://flows.sh/docs/localization). Based on the set language, the correct translation for the block data will be selected.
   * - `disabled` (default) - The user will be served content in the default language group of your organization.
   * - `automatic` - Automatically detect the user's language and use the matching language group. The language is determined by the `Navigator.language` property in the browser.
   * - Manual - A specific language string, e.g. `en-US`, `fr-FR`, etc. This will use the matching language group for the specified language. See [https://www.localeplanet.com/icu/](https://www.localeplanet.com/icu/) for a full list of supported languages.
   * @defaultValue `disabled`
   */
  language?: LanguageOption;
  /**
   * Enables the debug panel. Can be also invoked by pressing `Cmd + Option + Shift + F` on Mac or `Ctrl + Alt + Shift + F` on Windows/Linux.
   *
   * Disabled by default. Defaults to `true` when running on `localhost`.
   *
   * Passing `false` here will NOT disable the shortcut.
   */
  debug?: boolean;
  /**
   * Custom keyboard shortcut handler for opening the debug panel.
   *
   * By default, the debug panel opens with `Cmd + Option + Shift + F` on Mac or `Ctrl + Alt + Shift + F` on Windows/Linux.
   *
   * Use this function to customize the shortcut or disable it entirely.
   *
   * @param event - The `keydown` keyboard event to evaluate
   * @returns `true` to open the debug panel, `false` to ignore the shortcut
   *
   * @example
   * ```ts
   * // Disable debug panel shortcut
   * onDebugShortcut: () => false
   *
   * // Use custom shortcut
   * onDebugShortcut: (e) => {
   *   return e.ctrlKey && e.key === "c"
   * }
   * ```
   */
  onDebugShortcut?: (event: KeyboardEvent) => boolean;
}
