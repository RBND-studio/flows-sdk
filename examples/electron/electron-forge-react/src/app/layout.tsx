import { FC, ReactNode } from "react";
import { Flows } from "./flows";

type Props = {
  children?: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  return <Flows>{children}</Flows>;
};
