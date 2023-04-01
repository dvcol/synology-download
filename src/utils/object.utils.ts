/**
 * Recursive spread to deeply merge two objects.
 * @param source the original object (keys present in target are overridden)
 * @param target the target to be merge (keys present in source are lost)
 */
export const deepMerge = <T extends Record<string, any> = Record<string, any>>(source: T, target: T): T => {
  const merge: T = { ...source };
  Object.keys(target)?.forEach((key: keyof T) => {
    if (typeof target[key] === 'object') merge[key] = deepMerge(merge[key], target[key]);
    else merge[key] = target[key];
  });
  return merge;
};
