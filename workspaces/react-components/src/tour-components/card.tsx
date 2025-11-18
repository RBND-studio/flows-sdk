import { type TourCardProps, type TourComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseCard } from "../internal-components/base-card";
import { Dots } from "../internal-components/dots";

export type CardProps = TourComponentProps<TourCardProps>;

const Card: FC<CardProps> = (props) => {
  const dots = !props.hideProgress ? (
    <Dots
      count={props.__flows.tourVisibleStepCount ?? 0}
      index={props.__flows.tourVisibleStepIndex ?? 0}
    />
  ) : null;

  return (
    <BaseCard
      title={props.title}
      body={props.body}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      dots={dots}
    />
  );
};

export const BasicsV2Card = Card;
