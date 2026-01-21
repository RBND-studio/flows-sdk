import { type FC, type ReactNode } from "react";

export interface LinkComponentProps {
  children?: ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}
export type LinkComponentType = FC<LinkComponentProps>;
