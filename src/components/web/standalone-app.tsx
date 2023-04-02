import React from 'react';

import { App } from '../App';

import type { AppProps } from '../App';

import type { FC } from 'react';

export const StandaloneApp: FC<AppProps> = props => {
  return <App {...props} />;
};
