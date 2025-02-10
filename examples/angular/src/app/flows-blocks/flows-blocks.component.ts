import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActiveBlock, addFloatingBlocksChangeListener } from "@flows/js";
import { FlowsService } from "../flows.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "flows-blocks",
  imports: [CommonModule],
  templateUrl: "./flows-blocks.component.html",
})
export class FlowsBlocksComponent implements OnInit, OnDestroy {
  flowsService = inject(FlowsService);
  getComponent = this.flowsService.getComponent;

  readonly blocks = signal<ActiveBlock[]>([]);
  dispose: (() => void) | null = null;

  ngOnInit() {
    this.dispose = addFloatingBlocksChangeListener((newBlocks) => {
      this.blocks.set(newBlocks);
    });
  }

  ngOnDestroy() {
    this.dispose?.();
  }
}
