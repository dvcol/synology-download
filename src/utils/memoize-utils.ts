type AnyFunction = (...args: any[]) => any;
type AnyFunctionWithCache<T extends AnyFunction> = T & { cache: Record<string, ReturnType<T>> };

/**
 * Memoize a function
 *
 * @param fn the function to memoize in which a cache is created
 * @returns function a function with return from cache if it has been called with
 */
export const memoize = <T extends AnyFunction>(fn: T): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...params: Parameters<T>): ReturnType<T> => {
    const fun = fn as AnyFunctionWithCache<T>;
    const key = params.reduce((k, p) => `${k}-${p}`, '');

    fun.cache = fun.cache || {};
    if (!{}.hasOwnProperty.call(fun.cache, key)) fun.cache[key] = fn(...params);
    return fun.cache[key];
  };
};

/**
 * Function decorator to memoize results
 * @constructor
 */
export const Memoized = (target: any, name: string, descriptor: PropertyDescriptor) => ({
  ...descriptor,
  value: memoize(descriptor.value),
});
