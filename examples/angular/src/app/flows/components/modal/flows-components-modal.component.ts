import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "flows-components-modal",
  imports: [CommonModule],
  templateUrl: "./flows-components-modal.component.html",
})
export class FlowsComponentsModalComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) body!: string;
  @Input({ required: false }) continueText?: string;
  @Input({ required: true }) showCloseButton!: boolean;
  @Input({ required: true }) hideOverlay!: boolean;

  @Input({ required: true }) continue!: Function;
  @Input({ required: true }) close!: Function;
}
