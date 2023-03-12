import { catchError, of, tap } from 'rxjs';

import { getManifest, localGet, localSet } from '@dvcol/web-extension-utils';

import type { SyncedTaskSlice } from '@src/models';
import { LoggerService } from '@src/services';
import { restoreTasks } from '@src/store/actions';
import { tasksSlice } from '@src/store/slices/tasks.slice';
import { parseJSON, versionCheck } from '@src/utils';

import type { Store } from 'redux';

/** Restore extension tasks list */
export const restoreTaskSlice = (store: Store) =>
  localGet<SyncedTaskSlice>(tasksSlice.name).pipe(
    tap(tasks => {
      if (versionCheck('2.0.2', getManifest().version) < 1) {
        return localSet(tasksSlice.name, {}).subscribe();
      }

      LoggerService.debug('restoring tasks from chrome storage.', tasks);
      const restoredTasks = parseJSON<SyncedTaskSlice>(tasks);

      // restore tasks
      if (restoredTasks) store.dispatch(restoreTasks(restoredTasks));
    }),
    tap(() => LoggerService.debug('Task slice restored.')),
    catchError(err => {
      LoggerService.error('tasks slice failed to restore.', err);
      return of(null);
    }),
  );
