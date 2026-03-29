import type { StylisPlugin } from '@emotion/cache';

/**
 * Stylis plugin that fixes unreplaced `&\f` markers inside pseudo-functions like `:where()`.
 *
 * Emotion's built-in `compat` plugin uses `stylis.delimit()` to consume parenthesized content
 * as an opaque token, so `&\f` sequences inside `:where(&)` are never detected and replaced
 * with the parent selector. This plugin runs after `compat` and patches any remaining markers.
 *
 * @see https://github.com/emotion-js/emotion/issues/3366
 */
const ampersandMarkerRegex = /&\f/g;

export const fixNestedAmpersand: StylisPlugin = (element) => {
  if (element.type !== 'rule' || !Array.isArray(element.props)) return;

  let parent = element.parent;
  while (parent && parent.type !== 'rule') parent = parent.parent;
  if (!parent) return;

  const parentProps = parent.props as string[];

  for (let i = 0; i < element.props.length; i++) {
    const prop = element.props[i];
    if (prop.includes('&\f')) {
      const parentProp = parentProps[i % parentProps.length];
      element.props[i] = prop.replace(ampersandMarkerRegex, parentProp);
    }
  }
};
