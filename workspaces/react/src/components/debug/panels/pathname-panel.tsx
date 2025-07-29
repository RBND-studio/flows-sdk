import { type FC } from "react";

interface Props {
  pathname?: string;
}

export const PathnamePanel: FC<Props> = ({ pathname }) => {
  return <p>{pathname}</p>;
};
