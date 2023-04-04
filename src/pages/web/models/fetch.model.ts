export type FetchInputs = Parameters<typeof fetch>;
export type FetchIntercept = (...params: FetchInputs) => boolean;
export type FetchInterceptResponse = (...params: FetchInputs) => Response | Promise<Response>;
