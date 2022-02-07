import { TasksSlice } from '@src/models';
import { setTasks } from '@src/store/actions';
import { tasksSlice } from '@src/store/slices';
import { store } from '@src/store';
import { parseJSON } from '@src/utils';

/** Restore extension tasks list */
export const restoreTasks = () =>
  chrome.storage.sync.get(tasksSlice.name, ({ tasks }) => {
    console.debug('restoring tasks from chrome storage');
    const restoredTasks = parseJSON<TasksSlice['entities']>(tasks);
    // restore settings
    if (restoredTasks) {
      store.dispatch(setTasks(restoredTasks));
    }
  });
