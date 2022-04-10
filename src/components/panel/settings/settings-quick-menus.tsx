import { Typography } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { SettingsAccordion, SettingsQuickMenu } from '@src/components';
import type { QuickMenu } from '@src/models';
import { defaultQuickMenu, InterfaceHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { resetQuickMenus, saveQuickMenu } from '@src/store/actions';
import { getQuick } from '@src/store/selectors';
import { useI18n } from '@src/utils';

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
    <SettingsAccordion
      title={InterfaceHeader.quickMenu}
      list={menus}
      summary={m => (
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
      detail={m => <SettingsQuickMenu menu={m} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
