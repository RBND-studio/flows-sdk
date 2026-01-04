import { type FC, type ReactNode } from "react";
import { type LanguageOption, type UserProperties } from "@flows/shared";
import { type TourComponents, type Components } from "./types";
import { FlowsContext } from "./flows-context";
import { useRunningTours } from "./hooks/use-running-tours";
import { useBlocks } from "./hooks/use-blocks";
import { PathnameProvider } from "./contexts/pathname-context";
import { TourController } from "./tour-controller";
import { globalConfig } from "./lib/store";
import { FloatingBlocks } from "./components/floating-blocks";
import { Debug } from "./components/debug";

export interface FlowsProviderProps {
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
   *
   * If set to `null`, the SDK will be disabled and `children` will render while waiting for the `userId`. This is useful when loading the ID asynchronously.
   */
  userId: string | null;
  /**
   * Object with custom [user properties](https://flows.sh/docs/users/properties). Values can be string, number, boolean, or date.
   */
  userProperties?: UserProperties;
  /**
   * Custom API URL useful when using proxy to send Flows requests through your own domain.
   */
  apiUrl?: string;
  /**
   * Components used for workflow blocks.
   */
  components: Components;
  /**
   * Components used for tour blocks.
   */
  tourComponents: TourComponents;
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
   * onDebugShortcut={() => false}
   *
   * // Use custom shortcut
   * onDebugShortcut={(e) => {
   *   return e.ctrlKey && e.key === "c"
   * }}
   * ```
   */
  onDebugShortcut?: (event: KeyboardEvent) => boolean;

  children: ReactNode;
}

export const FlowsProvider: FC<FlowsProviderProps> = (props) => {
  if (!isProps(props)) return props.children;

  return (
    <PathnameProvider>
      <FlowsProviderInner {...props} />
    </PathnameProvider>
  );
};

type Props = Omit<FlowsProviderProps, "userId"> & { userId: string };
const isProps = (props: FlowsProviderProps): props is Props => {
  return typeof props.userId === "string";
};

const FlowsProviderInner: FC<Props> = ({
  children,
  apiUrl = "https://api.flows-cloud.com",
  environment,
  organizationId,
  userId,
  components,
  tourComponents,
  userProperties = {},
  language,
  debug,
  onDebugShortcut,
}) => {
  globalConfig.apiUrl = apiUrl;
  globalConfig.environment = environment;
  globalConfig.organizationId = organizationId;
  globalConfig.userId = userId;

  const { blocks, error, wsError, removeBlock, updateBlock } = useBlocks({
    apiUrl,
    environment,
    organizationId,
    userId,
    userProperties,
    language,
  });

  const runningTours = useRunningTours({ blocks, removeBlock });

  return (
    <FlowsContext.Provider
      value={{
        userProperties,
        blocks,
        components,
        runningTours,
        tourComponents,
        removeBlock,
        updateBlock,
      }}
    >
      {children}
      <FloatingBlocks />
      <TourController />

      <Debug
        enabled={debug}
        blocksError={error}
        wsError={wsError}
        environment={environment}
        organizationId={organizationId}
        userId={userId}
        userProperties={userProperties}
        onDebugKeydown={onDebugShortcut}
      />
    </FlowsContext.Provider>
  );
};
