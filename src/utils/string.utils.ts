import { buildFormData as _buildFormData, stringifyKeys as _stringifyKeys, stringifyParams as _stringifyParams } from '@dvcol/web-extension-utils';

export const buildFormData = _buildFormData;

export const stringifyKeys = _stringifyKeys;

export const stringifyParams = _stringifyParams;

export const parseMagnetLink = (uri: string): string => {
  // TODO Handle more than just magnet URL
  if (!uri?.includes('dn=')) return uri;
  const url = new URL(uri);
  const dn = url.searchParams.get('dn');
  return dn ?? uri;
};
