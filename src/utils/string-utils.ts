import { HttpParameters } from '@src/models';

export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;

export const encodeParam = (param: string) => encodeURIComponent(param);

export const stringifyParams = (params: HttpParameters): string =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v?.map(encodeParam).join(',') : encodeParam(v)}`)
    .join('&');
