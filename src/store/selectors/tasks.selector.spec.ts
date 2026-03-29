import type { Content } from '../../models/content.model';

import { vi } from 'vitest';

import { ContentSource, ContentStatusType } from '../../models/content.model';
import { TaskStatus } from '../../models/task.model';
import { geTasksIdsByStatusTypeReducer } from './tasks.selector';

vi.mock('../../services/logger/logger.service', () => ({
  LoggerService: { error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

function makeTask(id: string, status: TaskStatus): Content {
  return { id, status, source: ContentSource.Task, key: `task-${id}`, title: id } as Content;
}

describe('tasks.selector', () => {
  describe('geTasksIdsByStatusTypeReducer', () => {
    it('should categorize downloading tasks as active', () => {
      const result = geTasksIdsByStatusTypeReducer([makeTask('t1', TaskStatus.downloading)]);
      expect(result[ContentStatusType.active].has('t1')).toBe(true);
      expect(result[ContentStatusType.all].has('t1')).toBe(true);
    });

    it('should categorize seeding tasks as active', () => {
      const result = geTasksIdsByStatusTypeReducer([makeTask('t1', TaskStatus.seeding)]);
      expect(result[ContentStatusType.active].has('t1')).toBe(true);
    });

    it('should categorize paused tasks', () => {
      const result = geTasksIdsByStatusTypeReducer([makeTask('t1', TaskStatus.paused)]);
      expect(result[ContentStatusType.paused].has('t1')).toBe(true);
    });

    it('should categorize waiting tasks', () => {
      const items = [makeTask('t1', TaskStatus.waiting), makeTask('t2', TaskStatus.filehosting_waiting)];
      const result = geTasksIdsByStatusTypeReducer(items);
      expect(result[ContentStatusType.waiting].has('t1')).toBe(true);
      expect(result[ContentStatusType.waiting].has('t2')).toBe(true);
    });

    it('should categorize finishing tasks', () => {
      const items = [
        makeTask('t1', TaskStatus.finishing),
        makeTask('t2', TaskStatus.extracting),
        makeTask('t3', TaskStatus.hash_checking),
      ];
      const result = geTasksIdsByStatusTypeReducer(items);
      expect(result[ContentStatusType.finishing].size).toBe(3);
    });

    it('should categorize finished tasks', () => {
      const result = geTasksIdsByStatusTypeReducer([makeTask('t1', TaskStatus.finished)]);
      expect(result[ContentStatusType.finished].has('t1')).toBe(true);
    });

    it('should categorize error tasks', () => {
      const result = geTasksIdsByStatusTypeReducer([makeTask('t1', TaskStatus.error)]);
      expect(result[ContentStatusType.error].has('t1')).toBe(true);
    });

    it('should always add to all set', () => {
      const items = [
        makeTask('t1', TaskStatus.downloading),
        makeTask('t2', TaskStatus.paused),
        makeTask('t3', TaskStatus.finished),
      ];
      const result = geTasksIdsByStatusTypeReducer(items);
      expect(result[ContentStatusType.all].size).toBe(3);
    });

    it('should skip non-task items', () => {
      const download = { id: 'd1', status: 'downloading', source: ContentSource.Download, key: 'dl-d1' } as unknown as Content;
      const result = geTasksIdsByStatusTypeReducer([download, makeTask('t1', TaskStatus.downloading)]);
      expect(result[ContentStatusType.all].size).toBe(1);
    });
  });
});
