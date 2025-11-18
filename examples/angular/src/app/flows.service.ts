import { Injectable, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { init } from '@flows/js';
import { setupJsComponents } from '@flows/js-components';
import * as components from '@flows/js-components/components';
import * as tourComponents from '@flows/js-components/tour-components';

// Don't forget to import the CSS styles for Flows components
import '@flows/js-components/index.css';

import { Banner as AngularBanner } from './banner/banner';
import { TourBanner as AngularTourBanner } from './tour-banner/tour-banner';

@Injectable({
  providedIn: 'root',
})
export class FlowsService {
  init(injector: Injector) {
    init({
      organizationId: 'YOUR_ORGANIZATION_ID',
      userId: 'YOUR_USER_ID',
      environment: 'production',
    });

    const Banner = createCustomElement(AngularBanner, { injector });
    const TourBanner = createCustomElement(AngularTourBanner, { injector });

    setupJsComponents({
      components: {
        ...components,
        // Example of custom "Banner" component
        Banner,
      },
      tourComponents: {
        ...tourComponents,
        // Example of custom "Banner" component for tours
        Banner: TourBanner,
      },
    });
  }
}
