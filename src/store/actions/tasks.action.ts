import { tasksSlice } from '../slices/tasks.slice';

// Action creators are generated for each case reducer function
const { setTasks, spliceTasks, setStatuses, setTaskStats, resetTasks } = tasksSlice.actions;

// Export as named constants
export { setTasks, spliceTasks, setStatuses, setTaskStats, resetTasks };
