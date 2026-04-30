import Component from '@glimmer/component';
import { on } from '@ember/modifier';

export default class Banner extends Component {
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