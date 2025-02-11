import { Injectable, Type } from "@angular/core";
import { ActiveBlock, init } from "@flows/js";
import { FlowsComponentsModalComponent } from "./components/modal/flows-components-modal.component";
import { FlowsTourComponentsModalComponent } from "./tour-components/modal/flows-tour-components-modal.component";

const components: Record<string, Type<any>> = {
  Modal: FlowsComponentsModalComponent,
};

const tourComponents: Record<string, Type<any>> = {
  Modal: FlowsTourComponentsModalComponent,
};

@Injectable({
  providedIn: "root",
})
export class FlowsService {
  init() {
    init({
      organizationId: "YOUR_ORGANIZATION_ID",
      userId: "YOUR_USER_ID",
      environment: "production",
    });
  }

  getComponent(block: ActiveBlock) {
    if (block.type === "component") {
      return components[block.component];
    }

    if (block.type === "tour-component") {
      return tourComponents[block.component];
    }

    return null;
  }
}
