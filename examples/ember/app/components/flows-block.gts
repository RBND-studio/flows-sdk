import Component from '@glimmer/component';

import Banner from './banner';
import TourBanner from './tour-banner';
import type { ActiveBlock, ComponentProps, SurveyComponentProps, TourComponentProps } from '@flows/js';

type ComponentSignature = {
  Args: { props: ComponentProps }
}
type TourComponentSignature = {
  Args: { props: TourComponentProps }
}
type SurveyComponentSignature = {
  Args: { props: SurveyComponentProps }
}

const components: Record<string, typeof Component<ComponentSignature>> = {
  Banner,
} 
const tourComponents: Record<string, typeof Component<TourComponentSignature>> = {
  Banner: TourBanner,
}
const surveyComponents: Record<string, typeof Component<SurveyComponentSignature>> = {
}

type Signature =  {
  Args: {
    blockData: ActiveBlock
  }
}


// Helper component to render component based on received block data. Used for both floating and slot blocks.
export default class FlowsBlock extends Component<Signature> {
  get Component(){
    const blockType = this.args.blockData?.type;
    const componentName = this.args.blockData?.component;

    if(blockType === 'component'){
      return components[componentName];
    }
    if(blockType === 'tour-component'){
      return tourComponents[componentName];
    }
    if(blockType === 'survey'){
      return surveyComponents[componentName];
    }
  }

  <template>
    {{#if this.Component}}
      <this.Component @props={{@blockData.props}} />
    {{/if}}
  </template>
}