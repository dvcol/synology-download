export const patchFetch = (_global = window) => {
  const _fetch = _global.fetch;
  _global.fetch = (input, init) => {
    console.debug('fetching', { input, init });
    if (input.toString()?.startsWith('http://diskstation')) {
      return Promise.resolve(new Response(JSON.stringify({})));
    }
    return _fetch(input, init);
  };
};
