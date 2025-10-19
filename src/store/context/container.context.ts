import type { ContainerContextInstance } from '@src/models';

import { createContext } from 'react';

export const ContainerContext = createContext<ContainerContextInstance>({});
