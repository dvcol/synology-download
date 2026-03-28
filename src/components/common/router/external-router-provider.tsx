import type { FC } from 'react';

import type { OpenPopupPayload } from '../../../models/message.model';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChromeMessageType } from '../../../models/message.model';
import { AppRoute } from '../../../models/routes.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { onMessage } from '../../../utils/chrome/chrome-message.utils';

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
