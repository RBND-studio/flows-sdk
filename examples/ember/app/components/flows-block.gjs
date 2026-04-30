import Component from '@glimmer/component';

import Banner from './banner';
import TourBanner from './tour-banner';

const components = {
  Banner,
}
const tourComponents = {
  Banner: TourBanner,
}
const surveyComponents = {

}

// Helper component to render component based on received block data. Used for both floating and slot blocks.
export default class FlowsBlock extends Component {
  get Component(){
    const blockType = this.args.blockData?.type;
    const componentName = this.args.blockData?.component;

    if(blockType === 'component'){
      return components[componentName];
    }
    if(blockType === 'tour-component'){
      return tourComponents[componentName];
    }
    if(blockType === 'survey-component'){
      return surveyComponents[componentName];
    }
  }

  <template>
    {{#if this.Component}}
      <this.Component @props={{@blockData.props}} />
    {{/if}}
  </template>
}