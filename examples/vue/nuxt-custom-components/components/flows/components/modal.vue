<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";

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
  showCloseButton: {
    type: Boolean,
    required: true,
  },
  hideOverlay: {
    type: Boolean,
    required: true,
  },

  continue: {
    type: Function,
    required: true,
  },
  close: {
    type: Function,
    required: true,
  },
});

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    props.close();
  }
};
</script>

<template>
  <Dialog
    visible
    :modal="!props.hideOverlay"
    :header="props.title"
    :closable="props.showCloseButton"
    @update:visible="handleVisibleChange"
    :style="{ width: '320px' }"
  >
    <p>{{ props.body }}</p>
    <div class="footer">
      <Button v-if="!!props.continueText" @click="props.continue()">{{
        props.continueText
      }}</Button>
    </div>
  </Dialog>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  gap: 8px;
}
</style>
