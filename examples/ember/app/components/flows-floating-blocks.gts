import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { addFloatingBlocksChangeListener, getCurrentFloatingBlocks, type ActiveBlock } from "@flows/js"

import FlowsBlock from './flows-block';
import type Owner from '@ember/owner';

// Ember implementation of the <flows-floating-blocks> from @flows/js-components
// Because we cannot use Ember components with @flows/js-components, we implemented the same logic with a few lines of code
export default class FlowsFloatingBlocks extends Component {
  @tracked blocks: ActiveBlock[] = [];

  constructor(owner: Owner, args: {}) {
    super(owner, args);

    this.blocks = getCurrentFloatingBlocks();
    const dispose = addFloatingBlocksChangeListener((newBlocks) => {
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
  </template>
}