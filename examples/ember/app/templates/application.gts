import { pageTitle } from 'ember-page-title';
import { WelcomePage } from 'ember-welcome-page';

import FlowsFloatingBlocks from '../components/flows-floating-blocks';
import FlowsSlot from '../components/flows-slot';

<template>
  {{pageTitle "EmberExample"}}

  {{outlet}}

  {{! Flows Slot with optional placeholder }}
  <flows-slot data-slot-id="my-slot">
    <div data-placeholder>
      <h2>Placeholder</h2>
      <p>This is a placeholder for the slot</p>
    </div>
  </flows-slot>

  {{!-- Ember implementation of the <flows-slot> from @flows/js-components to support custom components --}}
  <FlowsSlot @id="my-slot">
    <div>
      <h2>Placeholder</h2>
      <p>This is a placeholder for the slot</p>
    </div>
  </FlowsSlot>

  {{! The following component displays Ember's default welcome message. }}
  <WelcomePage @extension="gts" />
  {{! Feel free to remove this! }}

  <flows-floating-blocks></flows-floating-blocks>

  {{!-- Ember implementation of the <flows-floating-blocks> from @flows/js-components to support custom components --}}
  <FlowsFloatingBlocks />
</template>
