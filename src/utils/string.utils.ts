import type { HttpParameters } from '@dvcol/web-extension-utils';

export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;

export const encodeParam = (param: string) => encodeURIComponent(param);

export const buildFormData = (params: HttpParameters): FormData =>
  Object.values(params).reduce((_form, [key, value]) => {
    _form.append(key, Array.isArray(value) ? value?.map(encodeParam).join(',') : encodeParam(value));
    return _form;
  }, new FormData());

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

export const stringifyKeys = <T extends Record<string, any>, R = Record<string, any>>(record: T): R =>
  Object.entries(record).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    if (value === null) return acc;
    acc[key as keyof R] = value?.toString();
    return acc;
  }, {} as R);
