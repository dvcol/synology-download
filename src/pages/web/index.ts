import { activateDemo, generateTask } from './mocks';

import { defineComponents } from './modules';

import type { TaskMock } from './mocks';

import type { ContentAppHtmlElement, FetchIntercept, Locales, LocalesFetch, StandaloneAppHtmlElement, WebComponents } from './models';

declare global {
  interface Window {
    /** Original chrome instance */
    _chrome: typeof chrome;
    /** Localized translations */
    _locales?: Locales;
    /** Active localization fetches */
    _localesFetch?: LocalesFetch;
    /** Original fetch instance */
    _fetch: typeof fetch;
    /** Selector for intercepted fetch calls */
    _fetchIntercept?: FetchIntercept;
    /** synology download wc instances */
    _synology: {
      content?: ContentAppHtmlElement;
      standalone?: StandaloneAppHtmlElement;
      mock?: {
        task?: TaskMock;
      };
    };
  }

  interface HTMLElementTagNameMap {
    [WebComponents.StandaloneApp]: Partial<StandaloneAppHtmlElement>;
    [WebComponents.ContentApp]: Partial<ContentAppHtmlElement>;
  }
}

export * from './modules';
export * from './models';

export { generateTask, activateDemo };

export default defineComponents;
