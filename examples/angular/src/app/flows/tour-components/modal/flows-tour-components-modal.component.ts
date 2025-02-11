import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "flows-tour-components-modal",
  imports: [CommonModule],
  templateUrl: "./flows-tour-components-modal.component.html",
})
export class FlowsTourComponentsModalComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) body!: string;
  @Input({ required: false }) continueText?: string;
  @Input({ required: false }) previousText?: string;
  @Input({ required: true }) showCloseButton!: boolean;
  @Input({ required: true }) hideOverlay!: boolean;

  @Input({ required: true }) continue!: Function;
  @Input({ required: true }) previous!: Function;
  @Input({ required: true }) cancel!: Function;
}
