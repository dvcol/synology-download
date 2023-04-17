import { FetchIntercept } from '@src/pages/web';
import { BaseLoggerService } from '@src/services';

export const patchFetch = (_global = window) => {
  if (!_global._fetchIntercept) _global._fetchIntercept = new FetchIntercept();

  _global._fetch = _global.fetch;
  _global.fetch = async (input, init) => {
    BaseLoggerService.debug('fetch intercepted', { input, init });
    if (_global._fetchIntercept?.filter(input, init)) {
      const response = await _global._fetchIntercept?.response(input, init);
      BaseLoggerService.debug('fetch returning', { input, init, response });
      if (response instanceof Response) return Promise.resolve(response);
      if (response) return new Response(JSON.stringify(response));
      return Promise.resolve(new Response(JSON.stringify({})));
    }
    return _global._fetch(input, init);
  };
};
