import type { FC, ReactNode } from "react";

import { FlowsProvider, type LinkComponentType } from "@flows/react";
import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import * as surveyComponents from "@flows/react-components/survey";
import "@flows/react-components/index.css";
import { Link } from "@tanstack/react-router";

import { Banner } from "~/components/banner";
import { TourBanner } from "~/components/tour-banner";

type Props = {
  children: ReactNode;
};

const LinkComponent: LinkComponentType = ({ href, children, className, onClick }) => (
  <Link to={href} className={className} onClick={onClick}>
    {children}
  </Link>
);

export const Flows: FC<Props> = ({ children }) => {
  return (
    <FlowsProvider
      organizationId="YOUR_ORGANIZATION_ID"
      userId="YOUR_USER_ID"
      environment="production"
      LinkComponent={LinkComponent}
      components={{
        ...components,
        Banner: Banner,
      }}
      tourComponents={{
        ...tourComponents,
        Banner: TourBanner,
      }}
      surveyComponents={{ ...surveyComponents }}
    >
      {children}
    </FlowsProvider>
  );
};
