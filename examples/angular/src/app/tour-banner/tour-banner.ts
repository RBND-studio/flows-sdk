import { Component, Input } from '@angular/core';
import { FlowsProperties, TourComponentProps } from '@flows/js';

type Props = TourComponentProps<{
  title: string;
  body: string;
}>;

@Component({
  selector: 'app-tour-banner',
  imports: [],
  templateUrl: './tour-banner.html',
  styleUrl: './tour-banner.css',
})
export class TourBanner implements Props {
  @Input() title = '';
  @Input() body = '';

  @Input() continue!: () => void;
  @Input() previous!: () => void;
  @Input() cancel!: () => void;

  @Input() __flows!: FlowsProperties;
}
