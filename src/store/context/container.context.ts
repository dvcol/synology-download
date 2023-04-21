import { createContext } from 'react';

import type { ContainerContextInstance } from '@src/models';

export const ContainerContext = createContext<ContainerContextInstance>({});
