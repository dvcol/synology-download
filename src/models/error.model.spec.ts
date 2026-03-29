import { ErrorType, FetchError, LoginError, NotReadyError, SynologyError } from './error.model';
import { CommonAPI } from './synology.model';

describe('error.model', () => {
  describe('synologyError', () => {
    it('should set message from ErrorMap when code is known', () => {
      const error = new SynologyError(CommonAPI.Info, { code: 100 });
      expect(error.message).toBe('Unknown error');
      expect(error.code).toBe(100);
      expect(error.api).toBe(CommonAPI.Info);
      expect(error.type).toBe(ErrorType.Synology);
    });

    it('should fallback to code as message when code is unknown', () => {
      const error = new SynologyError(CommonAPI.Info, { code: 99999 });
      expect(error.message).toBe('99999');
    });

    it('should map nested errors with messages from ErrorMap', () => {
      const error = new SynologyError(CommonAPI.Info, {
        code: 100,
        errors: [{ code: 101 }, { code: 99999 }],
      });
      expect(error.errors).toHaveLength(2);
      expect(error.errors![0].message).toBe('Invalid parameter');
      expect(error.errors![1].message).toBeUndefined();
    });

    it('should handle nested errors without code', () => {
      const error = new SynologyError(CommonAPI.Info, {
        code: 100,
        errors: [{} as never],
      });
      expect(error.errors![0]).toEqual({});
    });
  });

  describe('fetchError', () => {
    it('should wrap an error with default message', () => {
      const inner = new Error('network down');
      const error = new FetchError(inner);
      expect(error.message).toBe('fetch_failed');
      expect(error.error).toBe(inner);
      expect(error.type).toBe(ErrorType.Fetch);
    });

    it('should accept a custom message', () => {
      const error = new FetchError(new Error('x'), 'custom_msg');
      expect(error.message).toBe('custom_msg');
    });
  });

  describe('loginError', () => {
    it('should set type to Login', () => {
      const error = new LoginError('session expired');
      expect(error.type).toBe(ErrorType.Login);
      expect(error.message).toBe('session expired');
    });
  });

  describe('notReadyError', () => {
    it('should set type to NotReady', () => {
      const error = new NotReadyError('not initialized');
      expect(error.type).toBe(ErrorType.NotReady);
      expect(error.message).toBe('not initialized');
    });
  });
});
