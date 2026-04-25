import "@warp-drive/ember/install";
import Application from "@ember/application";
import compatModules from "@embroider/virtual/compat-modules";
import Resolver from "ember-resolver";
import loadInitializers from "ember-load-initializers";
import config from "ember-example/config/environment";
import { importSync, isDevelopingApp, macroCondition } from "@embroider/macros";
import setupInspector from "@embroider/legacy-inspector-support/ember-source-4.12";

import { init } from "@flows/js";
import { setupJsComponents } from "@flows/js-components";

import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";
import * as surveyComponents from "@flows/js-components/survey-components";

// Don't forget to import the CSS styles for Flows components
import "@flows/js-components/index.css";

if (macroCondition(isDevelopingApp())) {
  importSync("./deprecation-workflow");
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
  inspector = setupInspector(this);

  ready() {
    init({
      organizationId: "2d646d66-2543-42a1-914d-69584e73ed42",
      userId: "ember-user",
      environment: "production",
    });
    setupJsComponents({
      components: {
        ...components,
      },
      tourComponents: {
        ...tourComponents,
      },
      surveyComponents: {
        ...surveyComponents,
      },
    });
  }
}

loadInitializers(App, config.modulePrefix, compatModules);
