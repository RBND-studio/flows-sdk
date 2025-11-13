<script setup lang="ts">
import type { ComponentProps } from "@flows/js";

type Props = ComponentProps<{
  title: string;
  body: string;

  close: () => void;
}>;

const props = defineProps<Props>();
</script>

<template>
  <div>
    <h2>{{ props.title }}</h2>
    <p>{{ props.body }}</p>

    <button @click="props.close">Close</button>
  </div>
</template>
