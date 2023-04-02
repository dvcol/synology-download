import { patchAction, patchChrome, patchFetch, patchI18n, patchLocales, patchNotifications, patchStorage, patchTabs } from '@src/mocks';
import { patchDownloads } from '@src/mocks/chrome.downloads.mock';
import type { PatchOptions } from '@src/pages/web/models';

export const patchApi = async ({ patch, locales }: PatchOptions, _global = window) => {
  if (!patch) return;
  patchChrome(_global);

  patchAction(_global);
  patchStorage(_global);
  patchNotifications(_global);
  patchTabs(_global);

  patchDownloads(_global);

  patchFetch(_global);

  patchLocales(locales, _global);
  await patchI18n(_global);
};
