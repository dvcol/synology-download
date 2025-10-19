import type { MutableRefObject } from 'react';

import type { AppInstance } from '@src/models/app-instance.model';

export interface ContainerContextInstance {
  instance?: AppInstance;
  containerRef?: MutableRefObject<Element | null>;
}
