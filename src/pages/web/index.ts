import { activateDownloadDemo, activateTaskDemo, generateDownload, generateTask } from './mocks';

import { defineComponents } from './modules';

import type { BadgeMock, DownloadMock, FileMock, TaskMock } from './mocks';

import type { ContentAppHtmlElement, FetchIntercept, Locales, LocalesFetch, StandaloneAppHtmlElement, Synology, WebComponents } from './models';

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
    _synology: Synology;
  }

  interface HTMLElementTagNameMap {
    [WebComponents.StandaloneApp]: Partial<StandaloneAppHtmlElement>;
    [WebComponents.ContentApp]: Partial<ContentAppHtmlElement>;
  }
}

export * from './modules';
export * from './models';

const activateDemo = ({ task, download }: { task: Parameters<typeof activateTaskDemo>; download: Parameters<typeof activateDownloadDemo> }) => ({
  task: activateTaskDemo(...task),
  download: activateDownloadDemo(...download),
});

export { generateTask, generateDownload, activateTaskDemo, activateDownloadDemo, activateDemo };
export type { TaskMock, FileMock, DownloadMock, BadgeMock };

export default defineComponents;
