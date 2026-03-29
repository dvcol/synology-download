import type { QuickMenu } from '../../../../models/menu.model';
import type { ContentSettings } from '../../../../models/settings.model';
import type { StoreState } from '../../../../store/store';

import { CardHeader, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { defaultQuickMenu } from '../../../../models/menu.model';
import { defaultContentSettings, InterfaceHeader } from '../../../../models/settings.model';
import { resetQuickMenus, saveQuickMenu, setQuickMenus, syncContentSettings } from '../../../../store/actions/settings.action';
import { getContentSettings, getQuick } from '../../../../store/selectors/settings.selector';
import { useI18n } from '../../../../utils/webex.utils';
import { FormSwitch } from '../../../common/form/form-switch';
import { SettingsAccordion } from '../common/settings-accordion';
import { SettingsQuickMenu } from './settings-quick-menu';

export function SettingsQuickMenus() {
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
      header={(
        <CardHeader
          title={i18n('enabled_title')}
          subheader={i18n('enabled_subheader')}
          slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
          action={(
            <FormSwitch
              controllerProps={{ name: 'intercept', control }}
              formControlLabelProps={{ label: '' }}
              switchProps={{ onChange: async (_, checked) => toggleIntercept(checked) }}
            />
          )}
          sx={{ p: '0.5rem 0' }}
        />
      )}
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
          onRemove={async () => {
            setExpanded(false);
            return new Promise((r) => {
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
}
