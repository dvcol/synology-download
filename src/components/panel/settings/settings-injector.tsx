import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { StoreState } from '@src/store';
import { getInterfaceSize } from '@src/store/selectors';

import type { FC } from 'react';

export const SettingsInjector: FC = () => {
  const size = useSelector<StoreState, number>(getInterfaceSize);

  useEffect(() => {
    console.info('Size change', size);
    const html = document.querySelector<HTMLElement>('html');
    if (html) html.style.fontSize = `calc(1rem * ${size})`;
  }, [size]);
  return null;
};
