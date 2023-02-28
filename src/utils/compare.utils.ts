// eslint-disable-next-line no-nested-ternary
export const stringCompare = (a?: string, b?: string): number => (!a ? 1 : !b ? -1 : a.localeCompare(b));

// eslint-disable-next-line no-nested-ternary
export const numberCompare = (a?: number, b?: number): number => (!a ? 1 : !b ? -1 : a > b ? 1 : -1);
export const nullSafeCompare =
  <A, B>(compareFn: (a: A, b: B) => number, reverse = false) =>
  (a: A, b: B) => {
    let result;
    if (a == null && b == null) result = 0;
    else if (a == null) result = 1;
    else if (b == null) result = -1;
    else result = compareFn(a, b);
    return reverse ? -1 * result : result;
  };
