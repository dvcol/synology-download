import type { FC, PropsWithChildren } from 'react';

import type { ContainerContextInstance } from '../../../models/context.model';

import { useMemo } from 'react';

import { ContainerContext } from '../../../store/context/container.context';

export const ContainerContextProvider: FC<PropsWithChildren<ContainerContextInstance>> = ({ children, instance, containerRef }) => {
  const context = useMemo(() => ({ instance, containerRef }), [instance, containerRef]);
  return <ContainerContext value={context}>{children}</ContainerContext>;
};
