import { Typography } from '@mui/material';
import React from 'react';
import { defaultQuickMenu, InterfaceHeader, QuickMenu } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getQuick, resetQuickMenus, saveQuickMenu, StoreState } from '../../../store';
import { SettingsQuickMenu } from './settings-quick-menu';
import { SettingsInterface } from './settings-interface';
import { useI18n } from '../../../utils';

export const SettingsQuickMenus = () => {
  const i18n = useI18n('panel', 'settings', 'quick_menus');
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const addNew = (id: string) => {
    const newMenu = { ...defaultQuickMenu, id };
    dispatch(saveQuickMenu(newMenu));
  };

  const reset = () => dispatch(resetQuickMenus());

  return (
    <SettingsInterface
      title={InterfaceHeader.quickMenu}
      list={menus}
      summary={(m) => (
        <>
          <Typography sx={{ width: '40%', flexShrink: 0 }}>{m.title}</Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {m.destination?.path?.replaceAll('/', ' / ') ?? i18n('default_folder')}
          </Typography>
        </>
      )}
      detail={(m) => <SettingsQuickMenu menu={m} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
