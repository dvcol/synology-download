import { HttpParameters } from '../models';

export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;
export const stringifyParams = (params: HttpParameters): string =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
    .join('&');
