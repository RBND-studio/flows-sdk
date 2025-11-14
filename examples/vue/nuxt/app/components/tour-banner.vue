<script setup lang="ts">
import type { TourComponentProps } from "@flows/js";

type Props = TourComponentProps<{
  title: string;
  body: string;
}>;

const props = defineProps<Props>();
</script>

<template>
  <div>
    <h2>{{ props.title }}</h2>
    <p>{{ props.body }}</p>

    <button v-if="!!props.previous" @click="props.previous">Previous</button>
    <button @click="props.continue">Continue</button>
    <button @click="props.cancel">Cancel</button>
  </div>
</template>
