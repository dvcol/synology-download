import { ContentSource, ContentStatusType } from './content.model';

describe('content.model', () => {
  describe('contentSource', () => {
    it('should have Task and Download values', () => {
      expect(ContentSource.Task).toBe('task');
      expect(ContentSource.Download).toBe('download');
    });
  });

  describe('contentStatusType', () => {
    it('should have all status types', () => {
      expect(ContentStatusType.all).toBe('all');
      expect(ContentStatusType.active).toBe('active');
      expect(ContentStatusType.downloading).toBe('downloading');
      expect(ContentStatusType.finished).toBe('finished');
      expect(ContentStatusType.error).toBe('error');
    });
  });
});
