import { Store as StoreProxy } from 'webext-redux';

import { StorePortName } from '@src/models';

export const storeProxy = new StoreProxy({
  portName: StorePortName,
});
