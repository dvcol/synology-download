import { DownloadStatus } from './download.model';
import { ContentTabSort, defaultTabs, TabTemplate, templateTabs } from './tab.model';
import { TaskStatus } from './task.model';

describe('tab.model', () => {
  describe('templateTabs', () => {
    it('should have all tab templates', () => {
      const names = templateTabs.map(t => t.name);
      expect(names).toContain(TabTemplate.all);
      expect(names).toContain(TabTemplate.downloading);
      expect(names).toContain(TabTemplate.active);
      expect(names).toContain(TabTemplate.inactive);
      expect(names).toContain(TabTemplate.completed);
      expect(names).toContain(TabTemplate.stopped);
      expect(names).toContain(TabTemplate.tasks);
      expect(names).toContain(TabTemplate.downloads);
    });

    it('should have unique ids', () => {
      const ids = templateTabs.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all tab should include all task and download statuses', () => {
      const allTab = templateTabs.find(t => t.name === TabTemplate.all);
      expect(allTab).toBeDefined();
      for (const status of Object.values(TaskStatus)) {
        expect(allTab!.status).toContain(status);
      }
      for (const status of Object.values(DownloadStatus)) {
        expect(allTab!.status).toContain(status);
      }
    });

    it('downloads tab should include all download statuses', () => {
      const downloadTab = templateTabs.find(t => t.name === TabTemplate.downloads);
      expect(downloadTab).toBeDefined();
      for (const status of Object.values(DownloadStatus)) {
        expect(downloadTab!.status).toContain(status);
      }
    });
  });

  describe('defaultTabs', () => {
    it('should have 5 tabs', () => {
      expect(defaultTabs).toHaveLength(5);
    });

    it('should have unique ids', () => {
      const ids = defaultTabs.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should include all task statuses in first tab (all)', () => {
      const allTab = defaultTabs[0];
      expect(allTab.name).toBe(TabTemplate.all);
      for (const status of Object.values(TaskStatus)) {
        expect(allTab.status).toContain(status);
      }
    });
  });

  describe('contentTabSort', () => {
    it('should have all sort options', () => {
      expect(ContentTabSort.creation).toBe('creation');
      expect(ContentTabSort.title).toBe('title');
      expect(ContentTabSort.speed).toBe('speed');
      expect(ContentTabSort.size).toBe('size');
      expect(ContentTabSort.status).toBe('status');
      expect(ContentTabSort.progress).toBe('progress');
    });
  });
});
