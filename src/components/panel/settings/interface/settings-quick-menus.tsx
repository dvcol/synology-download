import type { QuickMenu } from '../../../../models/menu.model';
import type { ContentInterception, ContentSettings } from '../../../../models/settings.model';
import type { StoreState } from '../../../../store/store';

import { CardHeader, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { defaultQuickMenu } from '../../../../models/menu.model';
import { defaultContentSettings, InterfaceHeader, supportedContentInterceptions } from '../../../../models/settings.model';
import { resetQuickMenus, saveQuickMenu, setQuickMenus, syncContentSettings } from '../../../../store/actions/settings.action';
import { getContentInterceptions, getContentSettings, getQuick } from '../../../../store/selectors/settings.selector';
import { useI18n } from '../../../../utils/webex.utils';
import { FormCheckbox } from '../../../common/form/form-checkbox';
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

  const interceptions = useSelector(getContentInterceptions);

  const { control, getValues } = useForm<ContentSettings>({
    mode: 'onChange',
    defaultValues: {
      ...contentSettings,
      intercept: contentSettings.intercept ?? defaultContentSettings.intercept,
      interceptions,
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
        <>
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
          <CardHeader
            title={i18n('interceptions_title')}
            subheader={i18n('interceptions_subheader')}
            slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
            sx={{ p: '0.5rem 0' }}
          />
          <Grid container spacing={1} columnSpacing={1}>
            {(Object.keys(supportedContentInterceptions) as ContentInterception[]).map((interception) => {
              const definition = supportedContentInterceptions[interception];
              const label = 'protocol' in definition ? definition.protocol : definition.extension;
              return (
                <Grid size={{ xs: 6, sm: 4 }} key={interception}>
                  <FormCheckbox<ContentSettings>
                    controllerProps={{ name: `interceptions.${interception}`, control }}
                    formControlLabelProps={{ label }}
                    checkboxProps={{
                      disabled: contentSettings.intercept === false,
                      onChange: (_, checked) => dispatch(syncContentSettings({
                        interceptions: { ...getValues('interceptions'), [interception]: checked },
                      })),
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </>
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
