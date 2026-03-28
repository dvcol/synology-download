import type { ContainerContextInstance } from '../../models/context.model';

import { createContext } from 'react';

export const ContainerContext = createContext<ContainerContextInstance>({});
