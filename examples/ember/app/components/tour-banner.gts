import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import type { TourComponentProps } from '@flows/js';

type Signature =  {
  Args: {
    props: TourComponentProps<{
      title: string;
      body: string;
    }>
  }
}

export default class TourBanner extends Component<Signature> {
  handlePrevious = () => {
    this.args.props.previous?.()
  }

  handleContinue = () => {
    this.args.props.continue()
  }

  handleCancel = () => {
    this.args.props.cancel()
  }

  <template>
    <div>
      <p>{{@props.title}}</p>
      <p>{{@props.body}}</p>
      <div>
        {{!-- In the first step the previous function is undefined --}}
        {{#if @props.previous}}
          <button {{on "click" this.handlePrevious}}>Previous</button>
        {{/if}}
        <button {{on "click" this.handleContinue}}>Continue</button>
        <button {{on "click" this.handleCancel}}>Cancel</button>
      </div>
    </div>
  </template>
}