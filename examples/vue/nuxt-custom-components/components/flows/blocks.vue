<script lang="ts">
import {
  FlowsComponentsModal,
  FlowsComponentsTooltip,
  FlowsTourModal,
  FlowsTourTooltip,
} from "#components";

export const components: Record<string, Component> = {
  Modal: FlowsComponentsModal,
  Tooltip: FlowsComponentsTooltip,
};
export const tourComponents: Record<string, Component> = {
  Modal: FlowsTourModal,
  Tooltip: FlowsTourTooltip,
};
</script>

<script setup lang="ts">
import { addFloatingBlocksChangeListener, type ActiveBlock } from "@flows/js";

import type { Component } from "vue";

const blocks = ref<ActiveBlock[]>([]);

let dispose: () => void;

onMounted(() => {
  dispose = addFloatingBlocksChangeListener((newBlocks) => {
    blocks.value = newBlocks;
  });
});
onUnmounted(() => {
  dispose();
});
</script>

<template>
  <template v-for="block in blocks">
    <component
      v-if="block.type === 'component'"
      :is="components[block.component]"
      v-bind="block.props"
    />
    <component
      v-if="block.type === 'tour-component'"
      :is="tourComponents[block.component]"
      v-bind="block.props"
    />
  </template>
</template>
