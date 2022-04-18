import { localGet } from '@dvcol/web-extension-utils';

import type { TasksSlice } from '@src/models';
import { store } from '@src/store';
import { setTasks } from '@src/store/actions';
import { tasksSlice } from '@src/store/slices/tasks.slice';
import { parseJSON } from '@src/utils';

/** Restore extension tasks list */
export const restoreTasks = () =>
  localGet<TasksSlice['entities']>(tasksSlice.name).subscribe(tasks => {
    console.debug('restoring tasks from chrome storage');
    const restoredTasks = parseJSON<TasksSlice['entities']>(tasks);
    // restore settings
    if (restoredTasks) {
      store.dispatch(setTasks(restoredTasks));
    }
  });
