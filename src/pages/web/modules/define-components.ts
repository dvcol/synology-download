import { AppInstance } from '@src/models';

import { patchApi } from '@src/pages/web/modules/patch-api';

import type { PatchOptions } from '../models';

export const defineComponents = async (options?: PatchOptions, _global = window) => {
  await patchApi({ patch: false, ...options });

  /* eslint-disable @typescript-eslint/no-var-requires, global-require -- necessary for mocking global */
  if (customElements.get(`wc-${AppInstance.content}`)) {
    console.warn(`Custom element 'wc-${AppInstance.content}' is already defined.`);
  } else {
    customElements.define(`wc-${AppInstance.content}`, require('@src/pages/content/components/content-app-wc').ContentAppWc);
  }

  if (customElements.get(`wc-${AppInstance.standalone}`)) {
    console.warn(`Custom element 'wc-${AppInstance.standalone}' is already defined.`);
  } else {
    customElements.define(`wc-${AppInstance.standalone}`, require('@src/components/web/standalone-app-wc').StandaloneAppWc);
  }
  /* eslint-enable @typescript-eslint/no-var-requires, global-require */
};
