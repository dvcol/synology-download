import { catchError, of, tap } from 'rxjs';

import { localGet } from '@dvcol/web-extension-utils';

import type { TasksSlice } from '@src/models';
import { LoggerService } from '@src/services';
import { setTasks } from '@src/store/actions';
import { tasksSlice } from '@src/store/slices/tasks.slice';
import { parseJSON } from '@src/utils';

import type { Store } from 'redux';

/** Restore extension tasks list */
export const restoreTasks = (store: Store) =>
  localGet<TasksSlice['entities']>(tasksSlice.name).pipe(
    tap(tasks => {
      LoggerService.debug('restoring tasks from chrome storage.', tasks);
      const restoredTasks = parseJSON<TasksSlice['entities']>(tasks);

      // restore settings
      if (restoredTasks) store.dispatch(setTasks(restoredTasks));
    }),
    tap(() => LoggerService.debug('Task slice restored.')),
    catchError(err => {
      LoggerService.error('tasks slice failed to restore.', err);
      return of(null);
    }),
  );
