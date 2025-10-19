import type { FC, PropsWithChildren } from 'react';

import type { ContainerContextInstance } from '@src/models';

import React, { useMemo } from 'react';

import { ContainerContext } from '@src/store';

export const ContainerContextProvider: FC<PropsWithChildren<ContainerContextInstance>> = ({ children, instance, containerRef }) => {
  const context = useMemo(() => ({ instance, containerRef }), [instance, containerRef]);
  return <ContainerContext.Provider value={context}>{children}</ContainerContext.Provider>;
};
