import { tasksSlice } from '../slices/tasks.slice';

// Action creators are generated for each case reducer function
const {
  restoreTasks,
  setTasks,
  spliceTasks,
  setTaskStats,
  resetTasks,
  addStopping,
  removeStopping,
  resetStopping,
  setFiles,
  resetFiles,
  setTaskForm,
  clearTaskForm,
  addTasks,
} = tasksSlice.actions;

// Export as named constants
export {
  addStopping,
  addTasks,
  clearTaskForm,
  removeStopping,
  resetFiles,
  resetStopping,
  resetTasks,
  restoreTasks,
  setFiles,
  setTaskForm,
  setTasks,
  setTaskStats,
  spliceTasks,
};
