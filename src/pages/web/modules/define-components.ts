import { patchApi } from '@src/pages/web/modules/patch-api';

import { WebComponents } from '../models';

import type { PatchOptions } from '../models';

export type DefineComponentsOptions = PatchOptions & { components?: Partial<Record<WebComponents, string>> };

export const defineComponents = async (options?: DefineComponentsOptions, _global = window) => {
  await patchApi({ patch: false, ...options });

  /* eslint-disable @typescript-eslint/no-var-requires, global-require -- necessary for mocking global */
  const components: Record<string, CustomElementConstructor> = {
    [WebComponents.StandaloneApp]: require('@src/components/web/standalone-app-wc').StandaloneAppWc,
    [WebComponents.ContentApp]: require('@src/pages/content/components/content-app-wc').ContentAppWc,
  };
  /* eslint-enable @typescript-eslint/no-var-requires, global-require */

  Object.keys(options?.components ?? components)?.forEach(component => {
    const _name: string = options?.components?.[component as WebComponents] ?? component;
    if (customElements.get(_name)) {
      console.warn(`Custom element '${_name}' is already defined.`);
    } else {
      customElements.define(_name, components[component]);
    }
  });
};
