import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js"

import FlowsBlock from './flows-block';

// Ember implementation of the <flows-slot> from @flows/js-components
// Because we cannot use Ember components with @flows/js-components, we implemented the same logic with a few lines of code
export default class FlowsSlot extends Component {
  @tracked blocks = [];

  @computed("blocks")
  get noBlocks() {
    return this.blocks.length === 0;
  }

  constructor(...args) {
    super(...args);
    
    const slotId = this.args.id;

    this.blocks = getCurrentSlotBlocks(slotId);
    const dispose = addSlotBlocksChangeListener(slotId, (newBlocks) => {
      this.blocks = newBlocks;
    });

    registerDestructor(this, () => {
      dispose();
    });
  }

  <template>
    {{#each this.blocks as |block|}}
      <FlowsBlock @blockData={{block}} />
    {{/each}}

    {{#if this.noBlocks}}
      {{yield}}
    {{/if}}
  </template>

}