import { type StateMemoryTrigger } from "./components";

interface TourWait {
  interaction: string;
  element?: string;
  page?: { operator: string; value: string[] };
  ms?: number;
}

export interface PropertyMeta {
  key: string;
  type: string;
  value?: unknown;
  triggers?: StateMemoryTrigger[];
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
  tour_exit_by_targeting?: boolean;

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
