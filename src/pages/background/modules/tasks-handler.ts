import { catchError, finalize, map, of } from 'rxjs';

import type { SyncedTaskSlice } from '@src/models';
import { LoggerService } from '@src/services';
import { restoreTasks } from '@src/store/actions';
import { tasksSlice } from '@src/store/slices/tasks.slice';
import { getManifest, localGet, localSet, parseJSON, versionCheck } from '@src/utils';

import type { Store } from 'redux';

/** Restore extension tasks list */
export const restoreTaskSlice = (store: Store) =>
  localGet<SyncedTaskSlice>(tasksSlice.name).pipe(
    map(async tasks => {
      if (versionCheck(getManifest().version, '2.0.2') < 1) {
        localSet(tasksSlice.name, {}).subscribe();
        return tasks;
      }

      LoggerService.debug('Restoring Tasks from chrome storage...', tasks);
      const restoredTasks = parseJSON<SyncedTaskSlice>(tasks);

      // restore tasks
      if (restoredTasks) await store.dispatch(restoreTasks(restoredTasks));
      return tasks;
    }),
    finalize(() => LoggerService.debug('Task slice restored.')),
    catchError(err => {
      LoggerService.error('Tasks slice failed to restore.', err);
      return of(null);
    }),
  );
