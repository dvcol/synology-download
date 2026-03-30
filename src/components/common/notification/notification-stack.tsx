import type { SnackbarKey, SnackbarProviderProps } from 'notistack';
import type { FC } from 'react';

import { zIndexMax } from '@dvcol/web-extension-utils';
import { Slide } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { useMemo, useState } from 'react';

import { ExpandedContext } from './expanded-context';
import { Notifier } from './notification-notifier';
import { SnackNotificationContent } from './notification-snack';

export const NotificationStack: FC<Pick<SnackbarProviderProps, 'maxSnack'> & { container?: HTMLElement }> = ({ maxSnack, container = document.body }) => {
  const [stack, setStack] = useState<Record<SnackbarKey, boolean>>({});

  const handleEntered = (_node: HTMLElement, _isAppearing: boolean, key: SnackbarKey) =>
    setStack((_stack) => {
      Object.keys(_stack)?.forEach((k) => {
        _stack[k] = false;
      });
      return { ..._stack, [key]: true };
    });
  const handleExited = (_node: HTMLElement, key: SnackbarKey) =>
    setStack((_stack) => {
      const { [key]: _, ...rest } = _stack;
      return rest;
    });

  const components = useMemo(() => ({
    default: SnackNotificationContent,
    info: SnackNotificationContent,
    success: SnackNotificationContent,
    warning: SnackNotificationContent,
    error: SnackNotificationContent,
  }), []);

  return (
    <ExpandedContext value={stack}>
      <style>
        {`.notistack-SnackbarContainer { z-index: ${zIndexMax} !important; }`}
      </style>
      <SnackbarProvider
        domRoot={container}
        maxSnack={maxSnack}
        Components={components}
        onExited={handleExited}
        onEntered={handleEntered}
        TransitionComponent={Slide}
      >
        <Notifier container={container} />
      </SnackbarProvider>
    </ExpandedContext>
  );
};
