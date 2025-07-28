import { CardHeader, Typography } from '@mui/material';

import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { FormSwitch } from '@src/components';
import type { ContentSettings, QuickMenu } from '@src/models';
import { defaultContentSettings, defaultQuickMenu, InterfaceHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { resetQuickMenus, saveQuickMenu, setQuickMenus, syncContentSettings } from '@src/store/actions';
import { getContentSettings, getQuick } from '@src/store/selectors';
import { useI18n } from '@src/utils';

import { SettingsAccordion } from '../common';

import { SettingsQuickMenu } from './settings-quick-menu';

export const SettingsQuickMenus = () => {
  const i18n = useI18n('panel', 'settings', 'quick_menus');
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);
  const state = useState<string | false>(false);
  const setExpanded = state[1];

  const addNew = (id: string) => {
    const newMenu = { ...defaultQuickMenu, id };
    dispatch(saveQuickMenu(newMenu));
  };

  const reset = () => dispatch(resetQuickMenus());

  const onChange = (_menus: QuickMenu[]) => dispatch(setQuickMenus(_menus));

  const contentSettings = useSelector<StoreState, ContentSettings>(getContentSettings);

  const { control } = useForm<ContentSettings>({
    mode: 'onChange',
    defaultValues: {
      ...contentSettings,
      intercept: contentSettings.intercept ?? defaultContentSettings.intercept,
    },
  });

  async function toggleIntercept(enabled = true) {
    dispatch(syncContentSettings({ intercept: enabled }));
  }

  return (
    <SettingsAccordion
      state={state}
      title={InterfaceHeader.quickMenu}
      list={menus}
      header={
        <CardHeader
          title={i18n('enabled_title')}
          subheader={i18n('enabled_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormSwitch
              controllerProps={{ name: 'intercept', control }}
              formControlLabelProps={{ label: '' }}
              switchProps={{ onChange: (_, checked) => toggleIntercept(checked) }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
      }
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
      detail={m => (
        <SettingsQuickMenu
          menu={m}
          onRemove={() => {
            setExpanded(false);
            return new Promise(r => {
              setTimeout(r, 500);
            });
          }}
        />
      )}
      addNew={addNew}
      reset={reset}
      onChange={onChange}
    />
  );
};
