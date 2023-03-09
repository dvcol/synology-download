/**
 * Return a unique array by testing the reducer equality function. If an item reducing to true is already present it is deduplicated.
 * @param array the array to parse
 * @param reducer the equality reducer
 */
export const uniqueArray = <T>(array: T[], reducer: (item: T) => boolean): T[] =>
  array?.filter((value, index, self) => index === self.findIndex(reducer));
