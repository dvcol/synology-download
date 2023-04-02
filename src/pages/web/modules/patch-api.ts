import { patchAction, patchChrome, patchFetch, patchI18n, patchLocales, patchStorage } from '@src/mocks';
import { patchDownloads } from '@src/mocks/chrome.downloads.mock';
import type { PatchOptions } from '@src/pages/web/models';

export const patchApi = async ({ patch, locales }: PatchOptions) => {
  if (!patch) return;
  patchChrome();

  patchAction();
  patchStorage();
  patchDownloads();

  patchFetch();

  patchLocales(locales);
  await patchI18n();
};
