export const parseJSON = <T>(json?: string | object) => (typeof json == 'string' && json?.length ? JSON.parse(json) : json) as T;

export const encodeParam = (param: string) => encodeURIComponent(param);

export const buildFormData = (params: Record<string, string | string[] | Blob>): FormData =>
  Object.keys(params).reduce((_form, key) => {
    let value = params[key];
    if (Array.isArray(value)) value = value?.join(',');
    _form.append(key, value);
    return _form;
  }, new FormData());

export const stringifyParams = (params: { [key: string]: string | string[] }): string =>
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

export const stringifyKeys = <T extends Record<string, any>>(record: T, stringify = false): Record<string, string> =>
  Object.entries(record).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    if (value === null) return acc;
    acc[key] = stringify ? JSON.stringify(value) : value?.toString();
    return acc;
  }, {} as any);
