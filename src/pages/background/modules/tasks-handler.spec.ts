/* eslint-disable ts/no-unsafe-argument */
import type { StoreOrProxy } from '../../../models/store.model';

import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreTasks } from '../../../store/actions/tasks.action';
import { localGet, localSet, versionCheck } from '../../../utils/webex.utils';
import { restoreTaskSlice } from './tasks-handler';

vi.mock('../../../utils/webex.utils', () => ({
  localGet: vi.fn(),
  localSet: vi.fn(() => ({ subscribe: vi.fn() })),
  syncGet: vi.fn(() => of({})),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  ProxyLogger: class {
    debug = vi.fn();
  },
  getManifest: vi.fn(() => ({ version: '2.0.3' })),
  parseJSON: vi.fn((v: unknown) => v),
  versionCheck: vi.fn(() => 1),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../store/actions/tasks.action', () => ({
  restoreTasks: vi.fn((v: unknown) => ({ type: 'RESTORE_TASKS', payload: v })),
}));

vi.mock('../../../store/slices/tasks.slice', () => ({
  tasksSlice: { name: 'tasks' },
}));

describe('tasks-handler', () => {
  let store: StoreOrProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(),
      replaceReducer: vi.fn(),
      [Symbol.observable]: vi.fn(),
    } as unknown as StoreOrProxy;
  });

  it('should restore tasks from local storage when version check passes', () => {
    const tasks = { entities: {}, ids: [] };
    vi.mocked(localGet).mockReturnValue(of(tasks) as any);
    vi.mocked(versionCheck).mockReturnValue(1);

    restoreTaskSlice(store).subscribe();

    expect(restoreTasks).toHaveBeenCalledWith(tasks);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should clear tasks when version is too old', () => {
    const tasks = { entities: {}, ids: [] };
    vi.mocked(localGet).mockReturnValue(of(tasks) as any);
    vi.mocked(versionCheck).mockReturnValue(0);

    restoreTaskSlice(store).subscribe();

    expect(localSet).toHaveBeenCalledWith('tasks', {});
    expect(restoreTasks).not.toHaveBeenCalled();
  });

  it('should catch errors and return null', () => {
    vi.mocked(localGet).mockReturnValue(throwError(() => new Error('storage error')) as any);

    restoreTaskSlice(store).subscribe((val) => {
      expect(val).toBeNull();
    });
  });
});
