import type { ContextMenu } from '../../../../models/menu.model';
import type { ResetMenuPayload } from '../../../../models/message.model';
import type { ScrapeSettings } from '../../../../models/settings.model';
import type { StoreState } from '../../../../store/store';

import { CardHeader, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { firstValueFrom } from 'rxjs';

import { defaultContextMenu } from '../../../../models/menu.model';
import { ChromeMessageType } from '../../../../models/message.model';
import { defaultScrapeSettings, InterfaceHeader } from '../../../../models/settings.model';
import { resetContextMenu, saveContextMenu, setContextMenus, syncScrapeSettings } from '../../../../store/actions/settings.action';
import { getMenus, getScrapeSettings } from '../../../../store/selectors/settings.selector';
import { sendMessage } from '../../../../utils/chrome/chrome-message.utils';
import { useI18n } from '../../../../utils/webex.utils';
import { FormSwitch } from '../../../common/form/form-switch';
import { SettingsAccordion } from '../common/settings-accordion';
import { SettingsContextMenu } from './settings-context-menu';

export function SettingsContextMenus() {
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
      header={(
        <CardHeader
          title={i18n('scrape_menu_title')}
          subheader={i18n('scrape_menu_subheader')}
          slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
          action={(
            <FormSwitch
              controllerProps={{ name: 'menu', control }}
              formControlLabelProps={{ label: '' }}
              switchProps={{ onChange: async (_, checked) => toggleScrapeContextMenu(checked) }}
            />
          )}
          sx={{ p: '0.5rem 0' }}
        />
      )}
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
