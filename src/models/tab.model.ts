import {ColorLevel} from "./material-ui.model";
import {TaskStatus} from "./task.model";

export interface TaskTab {
    name: TabType | string,
    status?: TaskStatus | TaskStatus[],
    color?: ColorLevel,
    order?: string,
    reverse?: boolean
}

/**
 * Enumeration for message types
 */
export enum TabType {
    all = 'all',
    downloading = 'downloading',
    completed = 'completed',
    active = 'active',
    inactive = 'inactive',
    stopped = 'stopped'
}

export const defaultTabs: TaskTab[] = [
    {
        name: TabType.all,
        color: ColorLevel.primary
    },
    {
        name: TabType.downloading,
        status: TaskStatus.downloading
    },
    {
        name: TabType.completed,
        status: TaskStatus.finished,
        color: ColorLevel.success
    },
    {
        name: TabType.active,
        status: [TaskStatus.downloading, TaskStatus.finishing, TaskStatus.hash_checking, TaskStatus.extracting, TaskStatus.seeding]
    },
    {
        name: TabType.inactive,
        status: [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused, TaskStatus.error],
        color: ColorLevel.warning
    },
    {
        name: TabType.stopped,
        status: TaskStatus.paused,
        color: ColorLevel.error
    }
]
