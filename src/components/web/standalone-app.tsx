import React from 'react';

import type { StoreOrProxy } from '@src/models';

import { App } from '../App';

import type { EmotionCache } from '@emotion/utils';
import type { FC } from 'react';

export const StandaloneApp: FC<{ storeOrProxy: StoreOrProxy; cache: EmotionCache }> = ({ storeOrProxy, cache }) => {
  return <App store={storeOrProxy} cache={cache} />;
};
