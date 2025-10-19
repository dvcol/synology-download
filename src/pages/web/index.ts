import type { BadgeMock, DownloadMock, FileMock, TaskMock } from './mocks';
import type {
  AppInstance,
  ContentAppHtmlElement,
  FetchIntercept,
  Locales,
  LocalesFetch,
  StandaloneAppHtmlElement,
  Synology,
  WebComponents,
} from './models';
import type { patchApi } from './modules';

import { activateDownloadDemo, activateTaskDemo, generateDownload, generateTask } from './mocks';
import { defineComponents } from './modules';

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
    /** app instance (popup, panel, etc.) */
    _instance: AppInstance;
  }

  interface HTMLElementTagNameMap {
    [WebComponents.StandaloneApp]: Partial<StandaloneAppHtmlElement>;
    [WebComponents.ContentApp]: Partial<ContentAppHtmlElement>;
  }
}

function activateDemo({ task, download }: { task: Parameters<typeof activateTaskDemo>; download: Parameters<typeof activateDownloadDemo> }) {
  return {
    task: activateTaskDemo(...task),
    download: activateDownloadDemo(...download),
  };
}

interface SynologyDownload {
  generateTask: typeof generateTask;
  generateDownload: typeof generateDownload;
  activateTaskDemo: typeof activateTaskDemo;
  activateDownloadDemo: typeof activateDownloadDemo;
  activateDemo: typeof activateDemo;
  patchApi: typeof patchApi;
  defineComponents: typeof defineComponents;
}

const baseUrl = 'synology-download';

export * from './models';
export * from './modules';

export { activateDemo, activateDownloadDemo, activateTaskDemo, baseUrl, generateDownload, generateTask };
export type { BadgeMock, DownloadMock, FileMock, SynologyDownload, TaskMock };

export default defineComponents;
