import { TasksSlice } from '../../../models';
import { setTasks, store, tasksSlice } from '../../../store';
import { parseJSON } from '../../../utils';

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
