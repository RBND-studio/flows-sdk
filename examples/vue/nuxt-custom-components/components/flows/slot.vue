<script setup lang="ts">
import { addSlotBlocksChangeListener, type ActiveBlock } from "@flows/js";
import { components, tourComponents } from "./blocks.vue";

const { slotId } = defineProps({
  slotId: {
    type: String,
    required: true,
  },
});

const blocks = ref<ActiveBlock[]>([]);

let dispose: () => void;

onMounted(() => {
  dispose = addSlotBlocksChangeListener(slotId, (newBlocks) => {
    blocks.value = newBlocks;
  });
});
onUnmounted(() => {
  dispose();
});
</script>

<template>
  <template v-if="blocks.length === 0">
    <slot name="placeholder"></slot>
  </template>

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
