import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FlowsBlocksComponent } from "./flows-blocks/flows-blocks.component";
import { FlowsService } from "./flows.service";
import { FlowsSlotComponent } from "./flows-slot/flows-slot.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, FlowsBlocksComponent, FlowsSlotComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  flowsService = inject(FlowsService);

  title = "angular";

  ngOnInit() {
    if (typeof window !== "undefined") this.flowsService.init();
  }
}
