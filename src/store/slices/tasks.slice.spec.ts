/* eslint-disable ts/no-unsafe-argument */
import type { Task, TaskComplete, TaskFile, TaskForm } from '../../models/task.model';

import { describe, expect, it, vi } from 'vitest';

import { tasksSlice } from './tasks.slice';

vi.mock('../../utils/webex.utils', () => ({
  localSet: vi.fn(() => ({ subscribe: vi.fn() })),
  syncSet: vi.fn(() => ({ subscribe: vi.fn() })),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  ProxyLogger: class {
    debug = vi.fn(); info = vi.fn(); warn = vi.fn(); error = vi.fn();
  },
}));

vi.mock('../../utils/chrome/chrome.utils', () => ({
  setBadgeBackgroundColor: vi.fn(async () => Promise.resolve()),
  setBadgeText: vi.fn(async () => Promise.resolve()),
  setTitle: vi.fn(async () => Promise.resolve()),
  setIcon: vi.fn(async () => Promise.resolve()),
}));

const {
  addStopping,
  removeStopping,
  resetStopping,
  spliceTasks,
  setFiles,
  setTaskForm,
  clearTaskForm,
  resetTasks,
  addTasks,
  setTasks,
} = tasksSlice.actions;

const reducer = tasksSlice.reducer;

const initialState = {
  taskForm: {},
  stopping: {},
  tasks: {},
  tasksIds: [],
  files: {},
  filesIds: {},
  stats: undefined,
};

describe('tasksSlice', () => {
  describe('stopping', () => {
    it('addStopping should add task to stopping map', () => {
      const task = { taskId: 'stop-1' } as unknown as TaskComplete;
      const state = reducer(initialState as any, addStopping(task));
      expect(state.stopping['stop-1']).toEqual(task);
    });

    it('removeStopping should remove a single id', () => {
      const task = { taskId: 'stop-1' } as unknown as TaskComplete;
      let state = reducer(initialState as any, addStopping(task));
      state = reducer(state, removeStopping('stop-1'));
      expect(state.stopping['stop-1']).toBeUndefined();
    });

    it('removeStopping should remove an array of ids', () => {
      const task1 = { taskId: 'stop-1' } as unknown as TaskComplete;
      const task2 = { taskId: 'stop-2' } as unknown as TaskComplete;
      let state = reducer(initialState as any, addStopping(task1));
      state = reducer(state, addStopping(task2));
      state = reducer(state, removeStopping(['stop-1', 'stop-2']));
      expect(state.stopping).toEqual({});
    });

    it('resetStopping should clear stopping', () => {
      const task = { taskId: 'stop-1' } as unknown as TaskComplete;
      let state = reducer(initialState as any, addStopping(task));
      state = reducer(state, resetStopping());
      expect(state.stopping).toEqual({});
    });
  });

  describe('tasks', () => {
    it('spliceTasks should remove a single task by id', () => {
      const task = { id: 'task-1', title: 'Test' } as unknown as Task;
      let state = reducer(initialState as any, setTasks([task]));
      state = reducer(state, spliceTasks('task-1'));
      expect(state.tasks['task-1']).toBeUndefined();
      expect(state.tasksIds).not.toContain('task-1');
    });

    it('spliceTasks should remove an array of ids', () => {
      const task1 = { id: 'task-1', title: 'T1' } as unknown as Task;
      const task2 = { id: 'task-2', title: 'T2' } as unknown as Task;
      let state = reducer(initialState as any, setTasks([task1, task2]));
      state = reducer(state, spliceTasks(['task-1', 'task-2']));
      expect(state.tasks['task-1']).toBeUndefined();
      expect(state.tasks['task-2']).toBeUndefined();
      expect(state.tasksIds).toEqual([]);
    });

    it('addTasks should merge with existing tasks', () => {
      const task1 = { id: 'task-1', title: 'T1' } as unknown as Task;
      const task2 = { id: 'task-2', title: 'T2' } as unknown as Task;
      let state = reducer(initialState as any, setTasks([task1]));
      state = reducer(state, addTasks([task2]));
      expect(state.tasks['task-1']).toBeDefined();
      expect(state.tasks['task-2']).toBeDefined();
    });

    it('setTasks should replace all tasks', () => {
      const task1 = { id: 'task-1', title: 'T1' } as unknown as Task;
      const task2 = { id: 'task-2', title: 'T2' } as unknown as Task;
      let state = reducer(initialState as any, setTasks([task1]));
      state = reducer(state, setTasks([task2]));
      expect(state.tasks['task-1']).toBeUndefined();
      expect(state.tasks['task-2']).toBeDefined();
      expect(state.tasksIds).toEqual(['task-2']);
    });

    it('resetTasks should return initial state', () => {
      const task = { id: 'task-1', title: 'Test' } as unknown as Task;
      let state = reducer(initialState as any, setTasks([task]));
      state = reducer(state, resetTasks());
      expect(state).toEqual(initialState);
    });
  });

  describe('files', () => {
    it('setFiles should set files for a taskId', () => {
      const files = [{ filename: 'test.txt' }] as unknown as TaskFile[];
      const state = reducer(initialState as any, setFiles({ taskId: 'task-1', files }));
      expect(state.files['task-1']).toEqual(files);
    });
  });

  describe('taskForm', () => {
    it('setTaskForm should set form', () => {
      const form = { uri: 'http://test.com' } as unknown as TaskForm;
      const state = reducer(initialState as any, setTaskForm(form));
      expect(state.taskForm).toEqual(form);
    });

    it('clearTaskForm should reset form to {}', () => {
      const form = { uri: 'http://test.com' } as unknown as TaskForm;
      let state = reducer(initialState as any, setTaskForm(form));
      state = reducer(state, clearTaskForm());
      expect(state.taskForm).toEqual({});
    });
  });
});
