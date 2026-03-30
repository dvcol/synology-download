import type { SnackbarKey } from 'notistack';

import { createContext } from 'react';

export const ExpandedContext = createContext<Record<SnackbarKey, boolean>>({});
