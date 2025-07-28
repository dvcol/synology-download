import { Store as StoreProxy } from 'webext-redux';

import { type RootSlice, StorePortName } from '@src/models';

export const storeProxy = new StoreProxy<RootSlice>({
  portName: StorePortName,
});
