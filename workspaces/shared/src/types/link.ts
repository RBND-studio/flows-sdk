import { type ReactNode } from "react";

export interface LinkComponentProps {
  children?: ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}
