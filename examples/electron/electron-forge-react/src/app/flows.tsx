"use client";

import { FC, ReactNode } from "react";
import { FlowsProvider } from "@flows/react";
import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import * as surveyComponents from "@flows/react-components/survey";
import "@flows/react-components/index.css";

type Props = {
  children?: ReactNode;
};

export const Flows: FC<Props> = ({ children }) => {
  return (
    <FlowsProvider
      organizationId="YOUR_ORGANIZATION_ID"
      userId="YOUR_USER_ID"
      environment="production"
      components={{
        ...components,
      }}
      tourComponents={{
        ...tourComponents,
      }}
      surveyComponents={{
        ...surveyComponents,
      }}
    >
      {children}
    </FlowsProvider>
  );
};
