import type { SnackbarKey, SnackbarProviderProps } from 'notistack';
import type { FC } from 'react';

import type { SnackMessage } from '../../../models/notification.model';

import { zIndexMax } from '@dvcol/web-extension-utils';
import { Slide } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { useState } from 'react';

import { Notifier } from './notification-notifier';
import { SnackNotificationCard } from './notification-snack';

// TODO move to custom snack for next notistack version, see https://github.com/iamhosseindhv/notistack/issues/242
export const NotificationStack: FC<Pick<SnackbarProviderProps, 'maxSnack'>> = ({ maxSnack }) => {
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

  return (
    <>
      <style>{`.SnackbarContainer-root {z-index: ${zIndexMax} !important;}`}</style>
      <SnackbarProvider
        maxSnack={maxSnack}
        content={(key, message) => <SnackNotificationCard id={key} notification={message as unknown as SnackMessage} expanded={stack[key]} />}
        onExited={handleExited}
        onEntered={handleEntered}
        TransitionComponent={Slide as React.ComponentType}
      >
        <Notifier />
      </SnackbarProvider>
    </>
  );
};
