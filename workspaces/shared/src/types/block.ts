import { type StateMemoryTrigger } from "./components";

interface TourWait {
  interaction: string;
  element?: string;
  page?: { operator: string; value: string[] };
  ms?: number;
}

type PropertyMetaType = "state-memory" | "block-state" | "action";
interface PropertyMetaTemplate<T extends PropertyMetaType> {
  key: string;
  type: T;
}
type StateMemoryPropertyMeta = PropertyMetaTemplate<"state-memory"> & {
  value: boolean;
  triggers?: StateMemoryTrigger[];
};
type BlockStatePropertyMeta = PropertyMetaTemplate<"block-state"> & {
  value: Block;
};
interface ActionPropertyMeta extends PropertyMetaTemplate<"action"> {
  value: {
    label: string;
    exitNode?: string;
    url?: string;
    openInNew?: boolean;
  };
}
export type PropertyMeta = ActionPropertyMeta | BlockStatePropertyMeta | StateMemoryPropertyMeta;

export type TourTriggerType = "navigation" | "click" | "dom-element" | "not-dom-element";
export interface TourTriggerExpression {
  type: TourTriggerType;
  value?: string;
  values?: string[];
  operator?: string;
}

export interface TourTrigger {
  $and?: TourTriggerExpression[];
}

export interface Block {
  id: string;
  workflowId: string;
  key?: string;
  type: string;
  componentType?: string;
  data: Record<string, unknown>;
  propertyMeta?: PropertyMeta[];
  exitNodes: string[];

  slottable: boolean;
  slotId?: string;
  slotIndex?: number;

  page_targeting_operator?: string;
  page_targeting_values?: string[];

  tour_trigger?: TourTrigger;
  tourBlocks?: TourStep[];
  currentTourIndex?: number;
}

export interface TourStep {
  id: string;
  workflowId: string;
  key?: string;
  type: string;
  componentType?: string;
  data: Record<string, unknown>;
  propertyMeta?: PropertyMeta[];

  slottable: boolean;
  slotId?: string;
  slotIndex?: number;

  page_targeting_operator?: string;
  page_targeting_values?: string[];

  tourWait?: TourWait;
}

export interface BlockUpdatesPayload {
  exitedBlockIds: string[];
  updatedBlocks: Block[];
}
