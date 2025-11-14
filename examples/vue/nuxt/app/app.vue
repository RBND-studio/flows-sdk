<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- Slot with optional placeholder -->
    <flows-slot data-slot-id="my-slot">
      <div data-placeholder>
        <h2>Placeholder</h2>
        <p>This is a placeholder for the slot</p>
      </div>
    </flows-slot>

    <NuxtWelcome />

    <!-- Render floating blocks at the end of the DOM -->
    <flows-floating-blocks></flows-floating-blocks>
  </div>
</template>
