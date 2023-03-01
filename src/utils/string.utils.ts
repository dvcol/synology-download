import type { HttpParameters } from '@dvcol/web-extension-utils';

export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;

export const encodeParam = (param: string) => encodeURIComponent(param);

export const stringifyParams = (params: HttpParameters): string =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v?.map(encodeParam).join(',') : encodeParam(v)}`)
    .join('&');

export const parseMagnetLink = (uri: string): string => {
  // TODO Handle more than just magnet URL
  if (!uri?.includes('dn=')) return uri;
  const url = new URL(uri);
  const dn = url.searchParams.get('dn');
  return dn ?? uri;
};
