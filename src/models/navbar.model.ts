/**
 * Enumeration for message types
 */
import {ColorLevel} from "./material-ui.model";

export enum TabType {
    all = 'all',
    downloading = 'downloading',
    completed = 'completed',
    active = 'active',
    inactive = 'inactive',
    stopped = 'stopped'
}

/**
 * Mapping function between tab type and color level
 * @param type the TabType to map
 */
export const tabTypeToColor = (type: TabType) => {
    switch (type) {
        case TabType.all:
            return ColorLevel.primary;
        case TabType.inactive:
            return ColorLevel.warning;
        case TabType.stopped:
            return ColorLevel.error;
        case TabType.completed:
            return ColorLevel.success;
        default:
            return ColorLevel.info
    }
}