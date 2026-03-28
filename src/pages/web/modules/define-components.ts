import type { PatchOptions } from '../models';

import { StandaloneAppWc } from '../../../components/web/standalone-app-wc';
import { ContentAppWc } from '../../content/components/content-app-wc';
import { WebComponents } from '../models';
import { patchApi } from './patch-api';

export type DefineComponentsOptions = PatchOptions & { components?: Partial<Record<WebComponents, string>> };

export async function defineComponents(options?: DefineComponentsOptions, _global = window) {
  await patchApi({ patch: false, ...options });

  const components: Record<string, CustomElementConstructor> = {
    [WebComponents.StandaloneApp]: StandaloneAppWc,
    [WebComponents.ContentApp]: ContentAppWc,
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
