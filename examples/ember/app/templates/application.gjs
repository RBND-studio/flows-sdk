import { pageTitle } from 'ember-page-title';
import { WelcomePage } from 'ember-welcome-page';
import FlowsFloatingBlocks from '../components/flows-floating-blocks';

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

  <FlowsFloatingBlocks />
  
  {{! The following component displays Ember's default welcome message. }}
  <WelcomePage @extension="gjs" />
  {{! Feel free to remove this! }}

</template>
