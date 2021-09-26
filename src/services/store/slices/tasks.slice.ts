import {combineReducers, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TasksSlice} from "../../../models/tasks.model";
import {Task, TaskStatus} from "../../../models/task.model";
import {mockTasks} from "../../mock/task.mock";

const initialState: TasksSlice = {
    entities: mockTasks,
    statuses: []
}


export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setTasks: (state, action: PayloadAction<Task[]>) => ({...state, entities: action?.payload}),
        setStatuses: (state, action: PayloadAction<TaskStatus[]>) => ({...state, statuses: action?.payload}),
        reset: () => (initialState)
    }
})

// Action creators are generated for each case reducer function
export const {setTasks, setStatuses, reset} = tasksSlice.actions

const rootReducer = combineReducers({
    tasks: tasksSlice.reducer
});

export type TasksState = ReturnType<typeof rootReducer>;

export default tasksSlice.reducer
