import { generateTask } from '../../mocks/task.mock';

import { defineComponents } from './modules';

import type {
  ContentAppHtmlElement,
  FetchIntercept,
  FetchInterceptResponse,
  Locales,
  LocalesFetch,
  StandaloneAppHtmlElement,
  WebComponents,
} from './models';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
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
    /** Reducer for intercepted fetch responses */
    _fetchInterceptResponse?: FetchInterceptResponse;
    /** synology download wc instances */
    _synology: {
      content?: ContentAppHtmlElement;
      standalone?: StandaloneAppHtmlElement;
    };
  }

  interface HTMLElementTagNameMap {
    [WebComponents.StandaloneApp]: Partial<StandaloneAppHtmlElement>;
    [WebComponents.ContentApp]: Partial<ContentAppHtmlElement>;
  }
}

export * from './modules';
export * from './models';

export { generateTask };

export default defineComponents;
