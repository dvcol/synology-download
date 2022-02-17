import { tasksSlice } from '../slices';

// Action creators are generated for each case reducer function
const { setTasks, spliceTasks, setStatuses, setTasksCount, setTaskStats, resetTasks } = tasksSlice.actions;

// Export as named constants
export { setTasks, spliceTasks, setStatuses, setTasksCount, setTaskStats, resetTasks };
