import { Typography } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import type { ContextMenu } from '@src/models';
import { ChromeMessageType, defaultContextMenu, InterfaceHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { resetContextMenu, saveContextMenu, setContextMenus } from '@src/store/actions';
import { getMenus } from '@src/store/selectors';
import { useI18n, sendMessage } from '@src/utils';

import { SettingsAccordion } from '../common';

import { SettingsContextMenu } from './settings-context-menu';

export const SettingsContextMenus = () => {
  const i18n = useI18n('panel', 'settings', 'context_menus');
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, ContextMenu[]>(getMenus);

  const addNew = (id: string) => {
    const newMenu = { ...defaultContextMenu, id };
    sendMessage<ContextMenu>({ type: ChromeMessageType.addMenu, payload: newMenu }).subscribe(() => {
      dispatch(saveContextMenu(newMenu));
    });
  };

  const reset = () => {
    sendMessage<ContextMenu[]>({ type: ChromeMessageType.resetMenu, payload: [defaultContextMenu] }).subscribe(() => {
      dispatch(resetContextMenu());
    });
  };

  const onChange = (_menus: ContextMenu[]) => dispatch(setContextMenus(_menus));

  return (
    <SettingsAccordion
      title={InterfaceHeader.contextMenu}
      list={menus}
      summary={c => (
        <>
          <Typography sx={{ width: '40%', flexShrink: 0 }}>{c.title}</Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {c.destination?.path?.replaceAll('/', ' / ') ?? i18n('default_folder')}
          </Typography>
        </>
      )}
      detail={c => <SettingsContextMenu menu={c} />}
      addNew={addNew}
      reset={reset}
      onChange={onChange}
    />
  );
};
