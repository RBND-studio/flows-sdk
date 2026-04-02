"use client";

import { FC, ReactNode } from "react";
import Link from "next/link";
import { FlowsProvider } from "@flows/react";
import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import * as surveyComponents from "@flows/react-components/survey";
import "@flows/react-components/index.css";

import { Banner } from "@/components/banner";
import { TourBanner } from "@/components/tour-banner";

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
        Banner: Banner,
      }}
      tourComponents={{
        ...tourComponents,
        Banner: TourBanner,
      }}
      surveyComponents={{ ...surveyComponents }}
      LinkComponent={Link}
    >
      {children}
    </FlowsProvider>
  );
};
