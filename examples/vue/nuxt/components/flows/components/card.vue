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
});
</script>

<template>
  <div class="card">
    <h2>{{ props.title }}</h2>
    <p>{{ props.body }}</p>
  </div>
</template>

<style scoped>
.card {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
