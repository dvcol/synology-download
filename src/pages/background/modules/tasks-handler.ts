import type { StoreOrProxy, SyncedTaskSlice } from '../../../models/store.model';

import { catchError, finalize, map, of } from 'rxjs';

import { LoggerService } from '../../../services/logger/logger.service';
import { restoreTasks } from '../../../store/actions/tasks.action';
import { tasksSlice } from '../../../store/slices/tasks.slice';
import { getManifest, localGet, localSet, parseJSON, versionCheck } from '../../../utils/webex.utils';

/** Restore extension tasks list */
export function restoreTaskSlice(store: StoreOrProxy) {
  return localGet<SyncedTaskSlice>(tasksSlice.name).pipe(
    map(async (tasks) => {
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
    catchError((err) => {
      LoggerService.error('Tasks slice failed to restore.', err);
      return of(null);
    }),
  );
}
