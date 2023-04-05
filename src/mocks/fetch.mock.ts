import { CustomHeader } from '@src/models';
import type { FetchIntercept } from '@src/pages/web';
import { BaseLoggerService } from '@src/services';

export const defaultFetchIntercept: FetchIntercept = (_, init) => {
  if (!init?.headers) return false;
  if (init.headers instanceof Headers) return !!init.headers.get(CustomHeader.SynologyDownloadApp);
  if (Array.isArray(init.headers)) return init.headers?.some(([key]) => key === CustomHeader.SynologyDownloadApp);
  return !!init.headers[CustomHeader.SynologyDownloadApp];
};

export const patchFetch = (_global = window) => {
  if (!_global._fetchIntercept) _global._fetchIntercept = defaultFetchIntercept;

  _global._fetch = _global.fetch;
  _global.fetch = async (input, init) => {
    BaseLoggerService.debug('fetch intercepted', { input, init });
    if (_global._fetchIntercept?.(input, init)) {
      const response = await _global._fetchInterceptResponse?.(input, init);
      BaseLoggerService.debug('fetch returning', { input, init, response });
      if (response instanceof Response) return Promise.resolve(response);
      if (response) return new Response(JSON.stringify(response));
      return Promise.resolve(new Response(JSON.stringify({})));
    }
    return _global._fetch(input, init);
  };
};
