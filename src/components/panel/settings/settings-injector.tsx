import type { FC } from 'react';

import type { StoreState } from '../../../store/store';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { getInterfaceSize } from '../../../store/selectors/settings.selector';

export const SettingsInjector: FC = () => {
  const size = useSelector<StoreState, number>(getInterfaceSize);

  useEffect(() => {
    const html = document.querySelector<HTMLElement>('html');
    if (html) html.style.fontSize = `calc(1rem * ${size})`;
  }, [size]);
  return null;
};
