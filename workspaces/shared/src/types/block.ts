interface TourWait {
  interaction: string;
  element?: string;
  page?: { operator: string; value: string[] };
}

export interface Block {
  id: string;
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
