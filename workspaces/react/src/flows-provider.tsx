import { type FC, type ReactNode, useMemo } from "react";
import { type UserProperties } from "@flows/shared";
import { type TourComponents, type Components } from "./types";
import { Block } from "./block";
import { FlowsContext } from "./flows-context";
import { useRunningTours } from "./hooks/use-running-tours";
import { useBlocks } from "./hooks/use-blocks";
import { TourBlock } from "./tour-block";
import { PathnameProvider } from "./contexts/pathname-context";
import { TourController } from "./tour-controller";
import { globalConfig } from "./lib/store";

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
   * Unique user ID. If no ID is provided, all users will be treated as one.
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
   * Components used for workflow blocks.
   */
  components: Components;
  /**
   * Components used for tour blocks.
   */
  tourComponents: TourComponents;

  children: ReactNode;
}

export const FlowsProvider: FC<FlowsProviderProps> = ({
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

  const blocks = useBlocks({ apiUrl, environment, organizationId, userId, userProperties });

  const runningTours = useRunningTours({ blocks });

  const floatingBlocks = useMemo(
    () =>
      blocks.filter(
        (b) =>
          !b.slottable &&
          // tour block doesn't have componentType
          b.componentType,
      ),
    [blocks],
  );
  const floatingTourBlocks = useMemo(
    () => runningTours.filter((b) => b.activeStep && !b.activeStep.slottable),
    [runningTours],
  );

  return (
    <PathnameProvider>
      <FlowsContext.Provider value={{ blocks, components, runningTours, tourComponents }}>
        {children}
        {floatingBlocks.map((block) => {
          return <Block block={block} key={block.id} />;
        })}
        {floatingTourBlocks.map((tour) => {
          return <TourBlock key={tour.block.id} tour={tour} />;
        })}
        <TourController />
      </FlowsContext.Provider>
    </PathnameProvider>
  );
};
