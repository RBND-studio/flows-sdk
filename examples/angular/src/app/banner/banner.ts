import { Component, Input } from '@angular/core';
import { ComponentProps, FlowsProperties } from '@flows/js';

type Props = ComponentProps<{
  title: string;
  body: string;

  close: () => void;
}>;

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner implements Props {
  @Input() title = '';
  @Input() body = '';

  @Input({ required: true }) close!: () => void;
  @Input() __flows!: FlowsProperties;
}
