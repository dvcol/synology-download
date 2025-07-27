import { CardHeader, Typography } from '@mui/material';

import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { firstValueFrom } from 'rxjs';

import { FormSwitch } from '@src/components';
import type { ContextMenu, ResetMenuPayload, ScrapeSettings } from '@src/models';
import { ChromeMessageType, defaultContextMenu, defaultScrapeSettings, InterfaceHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { resetContextMenu, saveContextMenu, setContextMenus, syncScrapeSettings } from '@src/store/actions';
import { getMenus, getScrapeSettings } from '@src/store/selectors';
import { sendMessage, useI18n } from '@src/utils';

import { SettingsAccordion } from '../common';

import { SettingsContextMenu } from './settings-context-menu';

export const SettingsContextMenus = () => {
  const i18n = useI18n('panel', 'settings', 'context_menus');
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, ContextMenu[]>(getMenus);
  const state = useState<string | false>(false);
  const setExpanded = state[1];

  const scrapeMenu = useSelector<StoreState, ScrapeSettings>(getScrapeSettings);

  const addNew = (id: string) => {
    const newMenu = { ...defaultContextMenu, id };
    sendMessage<ContextMenu>({ type: ChromeMessageType.addMenu, payload: newMenu }).subscribe(() => {
      dispatch(saveContextMenu(newMenu));
    });
  };

  const reset = () => {
    sendMessage<ResetMenuPayload>({
      type: ChromeMessageType.resetMenu,
      payload: { menus: [defaultContextMenu], scrape: scrapeMenu.menu },
    }).subscribe(() => {
      dispatch(resetContextMenu());
    });
  };

  const onChange = (_menus: ContextMenu[]) => dispatch(setContextMenus(_menus));

  const { control } = useForm<ScrapeSettings>({
    mode: 'onChange',
    defaultValues: {
      ...scrapeMenu,
      menu: scrapeMenu.menu ?? defaultScrapeSettings.menu,
    },
  });

  async function toggleScrapeContextMenu(show = true) {
    await firstValueFrom(sendMessage<boolean>({ type: ChromeMessageType.toggleScrapeMenu, payload: show }));
    dispatch(syncScrapeSettings({ menu: show }));
  }

  return (
    <SettingsAccordion
      state={state}
      title={InterfaceHeader.contextMenu}
      list={menus}
      header={
        <CardHeader
          title={i18n('scrape_menu_title')}
          subheader={i18n('scrape_menu_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormSwitch
              controllerProps={{ name: 'menu', control }}
              formControlLabelProps={{ label: '' }}
              switchProps={{ onChange: (_, checked) => toggleScrapeContextMenu(checked) }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
      }
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
      detail={c => (
        <SettingsContextMenu
          menu={c}
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
