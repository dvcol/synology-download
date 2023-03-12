import { tasksSlice } from '../slices/tasks.slice';

// Action creators are generated for each case reducer function
const {
  restoreTasks,
  setTasks,
  spliceTasks,
  setStatuses,
  setTaskStats,
  resetTasks,
  addStopping,
  removeStopping,
  resetStopping,
  setFiles,
  resetFiles,
} = tasksSlice.actions;

// Export as named constants
export {
  restoreTasks,
  setTasks,
  spliceTasks,
  setStatuses,
  setTaskStats,
  resetTasks,
  addStopping,
  removeStopping,
  resetStopping,
  setFiles,
  resetFiles,
};
