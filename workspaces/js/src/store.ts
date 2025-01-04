import { type Block } from "@flows/shared";
import { signal } from "@preact/signals-core";
import { type FlowsConfiguration } from "./types/configuration";

export const blocks = signal<Block[]>([]);

type Configuration = Omit<FlowsConfiguration, "apiUrl"> & { apiUrl: string };
export const config = signal<Configuration>();
