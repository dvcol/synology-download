import { BaseLoggerService } from '@src/services';

import {
  patchAction,
  patchChrome,
  patchContextMenus,
  patchDownloads,
  patchFetch,
  patchFiles,
  patchI18n,
  patchLocales,
  patchNotifications,
  patchRuntime,
  patchStorage,
  patchTabs,
  patchTasks,
} from '../mocks';

import type { PatchOptions } from '../models';

export const patchApi = async ({ patch, locales }: PatchOptions, _global = window) => {
  if (!patch) return;

  BaseLoggerService.init({ source: 'patch' });

  patchChrome(_global);

  patchRuntime(_global);
  patchAction(_global);
  patchStorage(_global);
  patchNotifications(_global);
  patchTabs(_global);
  patchContextMenus(_global);

  patchDownloads(_global);

  patchFetch(_global);

  patchFiles(_global);
  patchTasks(_global);

  patchLocales(locales, _global);
  await patchI18n(_global);
};
