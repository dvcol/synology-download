import type { TaskPriority } from './synology.model';
import type { Task } from './task.model';

import { ContentSource } from './content.model';
import { ColorLevel } from './material-ui.model';
import { mapToTask, TaskStatus, taskStatusToColor, TaskType } from './task.model';

const baseTask: Task = {
  id: 'dbid_001',
  type: TaskType.bt,
  username: 'admin',
  title: 'test.torrent',
  size: 123456,
  status: TaskStatus.downloading,
  source: ContentSource.Task,
  key: 'task-dbid_001',
  additional: {
    detail: {
      destination: 'Download',
      uri: 'http://example.com/test.torrent',
      unzip_password: '',
      create_time: 1341210005,
      started_time: 0,
      completed_time: 0,
      priority: 'auto' as unknown as TaskPriority,
      total_peers: 0,
      total_pieces: 0,
      connected_seeders: 0,
      connected_leechers: 0,
      connected_peers: 0,
      seedelapsed: 0,
      waiting_seconds: 0,
    },
    transfer: {
      downloaded_pieces: 0,
      size_downloaded: '54642',
      size_uploaded: '435',
      speed_download: 2605,
      speed_upload: 0,
    },
  },
};

describe('task.model', () => {
  describe('taskStatusToColor', () => {
    it('should return info for downloading', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.downloading })).toBe(ColorLevel.info);
    });

    it('should return secondary for seeding', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.seeding })).toBe(ColorLevel.secondary);
    });

    it('should return success for finished', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.finished })).toBe(ColorLevel.success);
    });

    it('should return warning for paused', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.paused })).toBe(ColorLevel.warning);
    });

    it('should return error for error', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.error })).toBe(ColorLevel.error);
    });

    it('should return error when stopping', () => {
      expect(taskStatusToColor({ ...baseTask, stopping: true })).toBe(ColorLevel.error);
    });

    it('should return primary for waiting', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.waiting })).toBe(ColorLevel.primary);
    });

    it('should return primary for extracting', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.extracting })).toBe(ColorLevel.primary);
    });

    it('should return primary for hash_checking', () => {
      expect(taskStatusToColor({ ...baseTask, status: TaskStatus.hash_checking })).toBe(ColorLevel.primary);
    });
  });

  describe('mapToTask', () => {
    it('should set source to Task', () => {
      const result = mapToTask(baseTask);
      expect(result.source).toBe(ContentSource.Task);
    });

    it('should set key with source prefix', () => {
      const result = mapToTask(baseTask);
      expect(result.key).toBe(`${ContentSource.Task}-${baseTask.id}`);
    });

    it('should compute progress from transfer data', () => {
      const result = mapToTask(baseTask);
      expect(result.progress).toBeDefined();
      expect(typeof result.progress).toBe('number');
      expect(result.progress).toBe(44); // floor(54642/123456*100)
    });

    it('should set folder from detail destination', () => {
      const result = mapToTask(baseTask);
      expect(result.folder).toBe('Download');
    });

    it('should set speed from transfer', () => {
      const result = mapToTask(baseTask);
      expect(result.speed).toBe(2605);
    });

    it('should set received from transfer size_downloaded', () => {
      const result = mapToTask(baseTask);
      expect(result.received).toBe(54642);
    });

    it('should compute eta when speed > 0', () => {
      const result = mapToTask(baseTask);
      expect(result.eta).toBeDefined();
    });

    it('should handle task with no additional data', () => {
      const minimal = { ...baseTask, additional: undefined } as unknown as Task;
      const result = mapToTask(minimal);
      expect(result.progress).toBe(0);
      expect(result.folder).toBeUndefined();
      expect(result.speed).toBeUndefined();
    });

    it('should mark task as stopping if id is in stoppingIds', () => {
      const result = mapToTask(baseTask, ['dbid_001']);
      expect(result.stopping).toBe(true);
    });

    it('should not mark task as stopping if id is not in stoppingIds', () => {
      const result = mapToTask(baseTask, ['other_id']);
      expect(result.stopping).toBe(false);
    });

    it('should set createdAt from create_time', () => {
      const result = mapToTask(baseTask);
      expect(result.createdAt).toBe(1341210005 * 1000);
    });
  });
});
