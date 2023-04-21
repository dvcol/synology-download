import type { AppInstance } from '@src/models/app-instance.model';

import type { MutableRefObject } from 'react';

export type ContainerContextInstance = {
  instance?: AppInstance;
  containerRef?: MutableRefObject<Element | null>;
};
