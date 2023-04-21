import React from 'react';

import type { ContainerContextInstance } from '@src/models';
import { ContainerContext } from '@src/store';

import type { FC, PropsWithChildren } from 'react';

export const ContainerContextProvider: FC<PropsWithChildren<ContainerContextInstance>> = ({ children, instance, containerRef }) => {
  return <ContainerContext.Provider value={{ instance, containerRef }}>{children}</ContainerContext.Provider>;
};
