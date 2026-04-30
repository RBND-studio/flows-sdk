import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { addFloatingBlocksChangeListener, getCurrentFloatingBlocks } from "@flows/js"

import FlowsBlock from './flows-block';

// Ember implementation of the <flows-floating-blocks> from @flows/js-components
// Because we cannot use Ember components with @flows/js-components, we implemented the same logic with a few lines of code
export default class FlowsFloatingBlocks extends Component {
  @tracked blocks = [];

  constructor(...args) {
    super(...args);

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
      <FlowsBlock @block={{block}} />
    {{/each}}
  </template>
}