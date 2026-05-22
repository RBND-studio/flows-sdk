import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import type { ComponentProps } from '@flows/js';

type Signature =  {
  Args: {
    props: ComponentProps<{
      title: string;
      body: string;
      close: () => void;
    }>
  }
}

export default class Banner extends Component<Signature> {
  handleClose = () => {
    this.args.props.close()
  }

  <template>
    <div>
      <p>{{@props.title}}</p>
      <p>{{@props.body}}</p>
      <div>
        <button {{on "click" this.handleClose}}>Close</button>
      </div>
    </div>
  </template>
}