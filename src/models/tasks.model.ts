import {Task, TaskStatus} from "./task.model";

export interface TasksSlice {
    entities:Task[],
    statuses:TaskStatus[]
}
