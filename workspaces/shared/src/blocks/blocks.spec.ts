import type { Block, TourStep, TourStepType } from "../types";
import { filterVisibleBlocks } from "./blocks";
import { randomUUID } from "crypto";

const getTourStep = ({
  componentLibraryName,
  type,
}: {
  componentLibraryName?: string;
  type: TourStepType;
}): TourStep => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  componentLibraryName,
  data: {},
  slottable: false,
  type,
  componentType: type === "tour-component" ? "Modal" : undefined,
});

const getBlock = ({
  blockStateId,
  componentLibraryName,
  tourBlocks,
}: {
  blockStateId?: string | undefined;
  tourBlocks?: TourStep[];
  componentLibraryName?: string;
}): Block => ({
  id: randomUUID(),
  workflowId: randomUUID(),
  componentLibraryName,
  blockStateId,
  data: {},
  exitNodes: [],
  slottable: false,
  type: tourBlocks ? "tour" : "component",
  componentType: tourBlocks ? undefined : "Modal",
  tourBlocks,
});

describe("filterVisibleBlocks", () => {
  it("should filter out closed blocks", () => {
    const closedBlockStateIds = ["closed-block-1", "closed-block-2"];
    const blocks: Block[] = [
      getBlock({ blockStateId: "closed-block-1" }),
      getBlock({ blockStateId: "open-block" }),
    ];

    const visibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds,
      freeOrg: false,
      hostname: "example.com",
    });
    expect(visibleBlocks).toHaveLength(1);
    expect(visibleBlocks[0]?.blockStateId).toBe("open-block");
  });
  it("should return all blocks if no closed blocks are specified", () => {
    const blocks: Block[] = [
      getBlock({ blockStateId: "block-1" }),
      getBlock({ blockStateId: undefined }),
    ];

    const visibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds: [],
      freeOrg: false,
      hostname: "example.com",
    });
    expect(visibleBlocks).toHaveLength(2);
  });

  it("should keep all components when freeOrg is false or hostname is localhost", () => {
    const blocks: Block[] = [
      getBlock({ blockStateId: "block-1", componentLibraryName: "library-1" }),
      getBlock({ blockStateId: "block-2" }),
      getBlock({
        blockStateId: undefined,
        tourBlocks: [
          getTourStep({ componentLibraryName: "library-2", type: "tour-component" }),
          getTourStep({ type: "tour-component" }),
          getTourStep({ type: "wait" }),
        ],
      }),
    ];

    const visibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds: [],
      freeOrg: false,
      hostname: "example.com",
    });
    expect(visibleBlocks).toHaveLength(3);
    expect(visibleBlocks[2]?.tourBlocks).toHaveLength(3);

    const localhostVisibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds: [],
      freeOrg: true,
      hostname: "localhost",
    });
    expect(localhostVisibleBlocks).toHaveLength(3);
    expect(localhostVisibleBlocks[2]?.tourBlocks).toHaveLength(3);
  });
  it("should filter out custom components when freeOrg is true", () => {
    const blocks: Block[] = [
      getBlock({ blockStateId: "block-1", componentLibraryName: "library-1" }),
      getBlock({ blockStateId: "block-2" }),
      getBlock({
        blockStateId: undefined,
        tourBlocks: [
          getTourStep({ componentLibraryName: "library-2", type: "tour-component" }),
          getTourStep({ type: "tour-component" }),
          getTourStep({ type: "wait" }),
        ],
      }),
    ];
    const visibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds: [],
      freeOrg: true,
      hostname: "example.com",
    });
    expect(visibleBlocks).toHaveLength(2);
    expect(visibleBlocks[0]?.blockStateId).toBe("block-1");
    expect(visibleBlocks[1]?.tourBlocks).toHaveLength(2);
    expect(visibleBlocks[1]?.tourBlocks?.[0]?.componentLibraryName).toBe("library-2");
    expect(visibleBlocks[1]?.tourBlocks?.[1]?.type).toBe("wait");
  });
  it("should filter closed blocks and custom components at the same time", () => {
    const blocks: Block[] = [
      getBlock({ blockStateId: "block-1", componentLibraryName: "library-1" }),
      getBlock({ blockStateId: "block-2" }),
      getBlock({ blockStateId: "block-3" }),
      getBlock({
        blockStateId: "tour-block",
        tourBlocks: [getTourStep({ type: "tour-component" })],
      }),
    ];

    const visibleBlocks = filterVisibleBlocks(blocks, {
      closedBlockStateIds: ["block-2"],
      freeOrg: true,
      hostname: "example.com",
    });
    expect(visibleBlocks).toHaveLength(2);
    expect(visibleBlocks[0]?.blockStateId).toBe("block-1");
    expect(visibleBlocks[1]?.blockStateId).toBe("tour-block");
  });
});
