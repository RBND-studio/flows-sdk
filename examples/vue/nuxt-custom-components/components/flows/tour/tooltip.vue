<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  continueText: {
    type: String,
    required: false,
  },
  targetElement: {
    type: String,
    required: true,
  },
  showCloseButton: {
    type: Boolean,
    required: true,
  },
  placement: {
    type: String,
    required: false,
  },
  hideOverlay: {
    type: Boolean,
    required: true,
  },

  continue: {
    type: Function,
    required: true,
  },
  previous: {
    type: Function,
    required: false,
  },
  cancel: {
    required: true,
    type: Function,
  },
});
</script>

<template>
  <div>
    Tooltip example implementation will be added in the future. You can check React component to
    implement it yourself:
    https://github.com/RBND-studio/flows-sdk/blob/main/workspaces/react-components/src/internal-components/tooltip/base-tooltip.tsx
  </div>
</template>
