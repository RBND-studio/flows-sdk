import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { addFloatingBlocksChangeListener, getCurrentFloatingBlocks } from "@flows/js"



export default class FlowsFloatingBlocks extends Component{
  @tracked blocks = [];

  constructor(...args) {
    super(...args);

    this.blocks = getCurrentFloatingBlocks();
    const dispose =  addFloatingBlocksChangeListener((newBlocks) => {
      this.blocks = newBlocks;
    });

    registerDestructor(this, () => {
      dispose();
    });
  }


  <template>
    {{#each this.blocks as |block|}}
      {{#if block.type === "component"}}
        {{#if block.component === "Banner"}}
          <Banner @title="Hello world" />
        {{/if}}
      {{/if}}
    {{/each}}
  </template>

}