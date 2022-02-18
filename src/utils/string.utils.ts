import { HttpParameters } from '@src/models';
import { parse, ParsedQuery } from 'query-string';

export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;

export const encodeParam = (param: string) => encodeURIComponent(param);

export const stringifyParams = (params: HttpParameters): string =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v?.map(encodeParam).join(',') : encodeParam(v)}`)
    .join('&');

export const parseMagnetLink = (uri: string): string => {
  // TODO Handle more than just magnet URL
  const parsed: ParsedQuery = parse(uri);
  return typeof parsed?.dn === 'string' ? parsed?.dn : parsed?.dn?.shift() ?? uri;
};
