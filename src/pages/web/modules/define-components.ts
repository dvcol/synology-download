import { patchApi } from '@src/pages/web/modules/patch-api';

import { WebComponents } from '../models';

import type { PatchOptions } from '../models';

export const defineComponents = async (options?: PatchOptions, _global = window) => {
  await patchApi({ patch: false, ...options });

  /* eslint-disable @typescript-eslint/no-var-requires, global-require -- necessary for mocking global */
  const components: Record<string, CustomElementConstructor> = {
    [WebComponents.StandaloneApp]: require('@src/components/web/standalone-app-wc').StandaloneAppWc,
    [WebComponents.ContentApp]: require('@src/pages/content/components/content-app-wc').ContentAppWc,
  };
  /* eslint-enable @typescript-eslint/no-var-requires, global-require */

  Object.keys(components)?.forEach(component => {
    if (customElements.get(component)) {
      console.warn(`Custom element '${component}' is already defined.`);
    } else {
      customElements.define(component, components[component]);
    }
  });
};
