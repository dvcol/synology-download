export const patchFetch = () => {
  const _fetch = global.fetch;
  global.fetch = (input, init) => {
    console.debug('fetching', { input, init });
    if (input.toString()?.startsWith('http://diskstation')) {
      return Promise.resolve(new Response(JSON.stringify({})));
    }
    return _fetch(input, init);
  };
};
