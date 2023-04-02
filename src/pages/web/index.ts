import { defineComponents } from './modules';

import type { Locales, LocalesFetch } from './models';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window {
    _locales?: Locales;
    _localesFetch?: LocalesFetch;
  }
}

export { defineComponents };

export default defineComponents;
