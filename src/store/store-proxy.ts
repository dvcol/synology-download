import type { RootSlice } from '../models/store.model';

import { Store as StoreProxy } from 'webext-redux';

import { StorePortName } from '../models/store.model';

export const storeProxy = new StoreProxy<RootSlice>({
  portName: StorePortName,
});
