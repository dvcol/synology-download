/**
 * Purge global emotion context before removing old instance
 * @see https://github.com/emotion-js/emotion/blob/314a5fb08b0f730e7aa88da0c974dfea13cc9b32/packages/react/src/index.js#L17-L40
 */
export const purgeEmotionContext = () => {
  if (process.env.NODE_ENV !== 'production') {
    const globalContext: Record<string, any> = globalThis ?? window;
    Object.keys(globalContext).forEach(key => {
      if (key.startsWith('__EMOTION_REACT_')) {
        console.info('Purging emotion global variable', { key, value: globalContext[key] });
        delete globalContext[key];
      }
    });
  }
};
