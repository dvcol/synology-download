import type { FC } from 'react';

import type { OpenPopupPayload } from '@src/models';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute, ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { onMessage } from '@src/utils';

export const ExternalRouterProvider: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sub = onMessage<OpenPopupPayload>([ChromeMessageType.routeScrapePage, ChromeMessageType.routeTaskForm]).subscribe(({ message }) => {
      if (message?.type === ChromeMessageType.routeScrapePage) return navigate(AppRoute.Scrape);
      if (message?.type === ChromeMessageType.routeTaskForm) return navigate(AppRoute.Add, { state: message.payload?.form });
      LoggerService.error('Unknown message type', message);
    });

    return () => sub.unsubscribe();
  }, [navigate]);
  return <div hidden aria-hidden id="external-router-provider"></div>;
};
