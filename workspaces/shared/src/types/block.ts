interface TourWait {
  interaction: string;
  element?: string;
  page?: { operator: string; value: string[] };
  ms?: number;
}

export interface Block {
  id: string;
  workflowId: string;
  key?: string;
  type: string;
  componentType?: string;
  data: Record<string, unknown>;
  exitNodes: string[];

  slottable: boolean;
  slotId?: string;
  slotIndex?: number;

  page_targeting_operator?: string;
  page_targeting_values?: string[];

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
