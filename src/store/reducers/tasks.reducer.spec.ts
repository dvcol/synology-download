import type { TasksSlice } from '../../models/store.model';
import type { Task } from '../../models/task.model';

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ContentSource } from '../../models/content.model';
import { TaskStatus, TaskType } from '../../models/task.model';
import { localSet } from '../../utils/webex.utils';
import { setTasksStatsReducer, syncTaskReducer } from './tasks.reducer';

vi.mock('../../utils/webex.utils', () => ({
  localSet: vi.fn(() => of(undefined)),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
}));

vi.mock('../slices/tasks.slice', () => ({
  tasksSlice: { name: 'tasks', actions: {} },
}));

vi.mock('../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn() },
}));

const initialState: TasksSlice = {
  taskForm: {},
  stopping: {},
  tasks: {},
  tasksIds: [],
  files: {},
  filesIds: {},
  stats: undefined,
} as TasksSlice;

function makeTask(id: string): Task {
  return {
    id,
    type: TaskType.http,
    username: 'admin',
    title: `task-${id}`,
    size: 1000,
    status: TaskStatus.downloading,
    source: ContentSource.Task,
    key: `task-${id}`,
  };
}

describe('tasks.reducer', () => {
  describe('syncTaskReducer', () => {
    it('should normalize task array into tasks map and tasksIds', () => {
      const tasks = [makeTask('t1'), makeTask('t2')];
      const action = { type: 'test', payload: tasks };
      const result = syncTaskReducer(initialState, action);

      expect(result.tasks).toEqual({
        t1: tasks[0],
        t2: tasks[1],
      });
      expect(result.tasksIds).toEqual(['t1', 't2']);
    });

    it('should call localSet with normalized state', () => {
      vi.mocked(localSet).mockClear();

      const tasks = [makeTask('t1')];
      const action = { type: 'test', payload: tasks };
      syncTaskReducer(initialState, action);

      expect(localSet).toHaveBeenCalledWith('tasks', {
        tasks: { t1: tasks[0] },
        tasksIds: ['t1'],
      });
    });

    it('should handle empty task array', () => {
      const action = { type: 'test', payload: [] };
      const result = syncTaskReducer(initialState, action);

      expect(result.tasks).toEqual({});
      expect(result.tasksIds).toEqual([]);
    });
  });

  describe('setTasksStatsReducer', () => {
    it('should set stats on state', () => {
      const stats = { speed_download: 1024, speed_upload: 256, emule_speed_download: 0, emule_speed_upload: 0 };
      const action = { type: 'test', payload: stats };
      const result = setTasksStatsReducer(initialState, action);

      expect(result.stats).toEqual(stats);
    });

    it('should preserve other state properties', () => {
      const stats = { speed_download: 512, speed_upload: 128, emule_speed_download: 0, emule_speed_upload: 0 };
      const action = { type: 'test', payload: stats };
      const result = setTasksStatsReducer(initialState, action);

      expect(result.taskForm).toEqual({});
      expect(result.stopping).toEqual({});
      expect(result.tasksIds).toEqual([]);
    });
  });
});
