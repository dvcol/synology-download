import { defineComponents } from './modules';

import type { ContentAppHtmlElement, Locales, LocalesFetch, StandaloneAppHtmlElement, WebComponents } from './models';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window {
    _locales?: Locales;
    _localesFetch?: LocalesFetch;
  }

  interface HTMLElementTagNameMap {
    [WebComponents.StandaloneApp]: Partial<StandaloneAppHtmlElement>;
    [WebComponents.ContentApp]: Partial<ContentAppHtmlElement>;
  }
}

export * from './modules';
export * from './models';

export default defineComponents;
