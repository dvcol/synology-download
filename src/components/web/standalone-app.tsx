import type { FC } from 'react';

import type { AppProps } from '../App';

import React from 'react';

import { App } from '../App';

export const StandaloneApp: FC<AppProps> = (props) => {
  return <App {...props} />;
};
