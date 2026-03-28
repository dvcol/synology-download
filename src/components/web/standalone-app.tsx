import type { FC } from 'react';

import type { AppProps } from '../App';

import { App } from '../App';

export const StandaloneApp: FC<AppProps> = (props) => {
  return <App {...props} />;
};
