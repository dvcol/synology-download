import { CustomHeader } from '@src/models';

export type FetchInputs = Parameters<typeof fetch>;
export type FetchInterceptFilter = (...params: FetchInputs) => boolean;
export type FetchInterceptHandler = [FetchInterceptFilter, FetchInterceptResponse];
export type FetchInterceptResponse = (...params: FetchInputs) => Record<string, any> | Response | Promise<Response> | void;

export const defaultFetchInterceptFilter: FetchInterceptFilter = (_, init) => {
  if (!init?.headers) return false;
  if (init.headers instanceof Headers) return !!init.headers.get(CustomHeader.SynologyDownloadApp);
  if (Array.isArray(init.headers)) return init.headers?.some(([key]) => key === CustomHeader.SynologyDownloadApp);
  return !!init.headers[CustomHeader.SynologyDownloadApp];
};

export class FetchIntercept {
  readonly filter: FetchInterceptFilter;
  readonly handlers: FetchInterceptHandler[];

  constructor(filter: FetchInterceptFilter = defaultFetchInterceptFilter, handlers: FetchInterceptHandler[] = []) {
    this.filter = filter;
    this.handlers = handlers;
  }

  response(...params: FetchInputs): ReturnType<FetchInterceptResponse> {
    const response = this.handlers.find(([filter]) => filter(...params))?.[1];
    return response?.(...params);
  }

  push(...handlers: FetchInterceptHandler[]): number {
    return this.handlers.push(...handlers);
  }
}
