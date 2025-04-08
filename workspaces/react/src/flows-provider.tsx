import { type FC, type ReactNode } from "react";
import { type UserProperties } from "@flows/shared";
import { type TourComponents, type Components } from "./types";
import { FlowsContext } from "./flows-context";
import { useRunningTours } from "./hooks/use-running-tours";
import { useBlocks } from "./hooks/use-blocks";
import { PathnameProvider } from "./contexts/pathname-context";
import { TourController } from "./tour-controller";
import { globalConfig } from "./lib/store";
import { FloatingBlocks } from "./components/floating-blocks";

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
   * Unique user ID.
   *
   * When `null` is passed the SDK is disabled. This is useful when you need to load the User ID asynchronously.
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

  children: ReactNode;
}

export const FlowsProvider: FC<FlowsProviderProps> = (props) => {
  if (!isProps(props)) return props.children;

  return <FlowsProviderInner {...props} />;
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
  userProperties,
}) => {
  globalConfig.apiUrl = apiUrl;
  globalConfig.environment = environment;
  globalConfig.organizationId = organizationId;
  globalConfig.userId = userId;

  const { blocks, removeBlock, updateBlock } = useBlocks({
    apiUrl,
    environment,
    organizationId,
    userId,
    userProperties,
  });

  const runningTours = useRunningTours({ blocks, removeBlock });

  return (
    <PathnameProvider>
      <FlowsContext.Provider
        value={{
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
      </FlowsContext.Provider>
    </PathnameProvider>
  );
};
