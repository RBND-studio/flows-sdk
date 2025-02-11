import { Component, inject, Input, signal, TemplateRef } from "@angular/core";
import { ActiveBlock, addSlotBlocksChangeListener } from "@flows/js";
import { FlowsService } from "../flows.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "flows-slot",
  imports: [CommonModule],
  templateUrl: "./flows-slot.component.html",
})
export class FlowsSlotComponent {
  flowsService = inject(FlowsService);
  getComponent = this.flowsService.getComponent;

  @Input({ required: true }) slotId!: string;
  @Input({ required: false }) placeholder: TemplateRef<any> | null = null;

  readonly blocks = signal<ActiveBlock[]>([]);
  dispose: (() => void) | null = null;

  ngOnInit() {
    this.dispose = addSlotBlocksChangeListener(this.slotId, (newBlocks) => {
      this.blocks.set(newBlocks);
    });
  }

  ngOnDestroy() {
    this.dispose?.();
  }
}
