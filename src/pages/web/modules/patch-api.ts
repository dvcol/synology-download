import {
  patchAction,
  patchChrome,
  patchContextMenus,
  patchDownloads,
  patchFetch,
  patchI18n,
  patchLocales,
  patchNotifications,
  patchRuntime,
  patchStorage,
  patchTabs,
  patchTasks,
} from '@src/pages/web/mocks';
import type { PatchOptions } from '@src/pages/web/models';
import { BaseLoggerService } from '@src/services';

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

  patchTasks(_global);

  patchLocales(locales, _global);
  await patchI18n(_global);
};
