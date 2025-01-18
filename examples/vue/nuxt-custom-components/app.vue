<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- Slot with optional placeholder -->
    <FlowsSlot slot-id="my-slot">
      <template #placeholder>
        <div>
          <h1>Placeholder</h1>
          <p>This is a placeholder for the slot</p>
        </div>
      </template>
    </FlowsSlot>

    <NuxtWelcome />

    <!-- Render floating blocks globally at the end of the <body /> -->
    <FlowsBlocks />
  </div>
</template>
