import type { FetchInputs } from '@src/pages/web';

export const resolveUrl = (input: FetchInputs[0]): string | undefined => {
  let url: string | undefined;
  if (typeof input === 'string') url = input;
  else if (input instanceof URL) url = input.toString();
  else if (input instanceof Request) url = input.url;
  return url;
};
