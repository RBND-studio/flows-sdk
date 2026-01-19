import { type CardProps as LibraryCardProps, type ComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseCard } from "../internal-components/base-card";

export type CardProps = ComponentProps<LibraryCardProps>;

const Card: FC<CardProps> = (props) => {
  return (
    <BaseCard
      title={props.title}
      body={props.body}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      onClose={props.dismissible ? props.close : undefined}
      width={props.width}
      tour={false}
      LinkComponent={props.__flows.LinkComponent}
    />
  );
};

export const BasicsV2Card = Card;
