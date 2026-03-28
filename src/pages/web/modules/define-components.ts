import type { PatchOptions } from '../models';

import { WebComponents } from '../models';
import { patchApi } from './patch-api';

export type DefineComponentsOptions = PatchOptions & { components?: Partial<Record<WebComponents, string>> };

export async function defineComponents(options?: DefineComponentsOptions, _global = window) {
  await patchApi({ patch: false, ...options });

  const components: Record<string, CustomElementConstructor> = {
    // eslint-disable-next-line ts/no-require-imports,ts/no-unsafe-member-access,ts/no-unsafe-assignment
    [WebComponents.StandaloneApp]: require('../../../components/web/standalone-app-wc').StandaloneAppWc,
    // eslint-disable-next-line ts/no-require-imports,ts/no-unsafe-member-access,ts/no-unsafe-assignment
    [WebComponents.ContentApp]: require('../../content/components/content-app-wc').ContentAppWc,
  };

  Object.keys(options?.components ?? components)?.forEach((component) => {
    const _name: string = options?.components?.[component as WebComponents] ?? component;
    if (customElements.get(_name)) {
      console.warn(`Custom element '${_name}' is already defined.`);
    } else {
      customElements.define(_name, components[component]);
    }
  });
}
