import { Button, Card, CardHeader, Collapse, Grid, MenuItem } from '@mui/material';

import React from 'react';

import { FormExplorer, FormSwitch } from '@src/components';
import type { ContentTab, Tab, TabStatus } from '@src/models';
import {
  ColorLevel,
  defaultNotifications,
  DownloadStatus,
  getColorFromLevel,
  getLevelFromColor,
  TabTemplate,
  TaskStatus,
  templateTabs,
} from '@src/models';
import { useI18n } from '@src/utils';

import { FormCheckbox } from './form-checkbox';
import { FormInput } from './form-input';

import type { UseFormReturn } from 'react-hook-form/dist/types/form';

export const FormTab = ({
  useFormProps: { control, getValues, setValue },
  tab: { template, status, color },
  disabled,
}: React.PropsWithChildren<{
  useFormProps: Pick<UseFormReturn<Tab>, 'control' | 'getValues' | 'setValue'>;
  tab: Tab;
  disabled?: boolean;
}>) => {
  const i18n = useI18n('common', 'form', 'tab');
  const getTab = (type?: TabTemplate | string): ContentTab | undefined => templateTabs.find(t => t.name === type);
  const getTemplateStatuses = (tab?: Tab): TabStatus[] => (tab?.status?.length ? tab?.status : status) ?? [];

  const [templateStatuses, setTemplateStatuses] = React.useState<TabStatus[]>(getTemplateStatuses(getTab(template)));
  const [badgeColor, setBadgeColor] = React.useState<Tab['color']>(color);

  const onTemplateChange = (type: string) => {
    const tab = getTab(type);
    const _status = getTemplateStatuses(tab);
    setTemplateStatuses(_status);
    const _color = getColorFromLevel(tab?.color) ?? color;
    setBadgeColor(_color);
    setValue('status', _status);
    setValue('color', _color);
  };

  const getHighlightColor = (s: TabStatus): ColorLevel => {
    const _color = getLevelFromColor(badgeColor);
    return _color && templateStatuses?.includes(s) ? _color : ColorLevel.primary;
  };

  return (
    <React.Fragment>
      <CardHeader
        title={i18n('base_template_title')}
        subheader={i18n('base_template_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'template', control }}
            textFieldProps={{
              select: true,
              label: i18n('base_template_label'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
              disabled,
              onChange: e => onTemplateChange(e.target.value),
            }}
          >
            {Object.values(TabTemplate).map(tab => (
              <MenuItem key={tab} value={tab} sx={{ textTransform: 'capitalize' }}>
                {i18n(tab, 'common', 'model', 'task_tab_type')}
              </MenuItem>
            ))}
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('badge_color_title')}
        subheader={i18n('badge_color_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'color', control }}
            textFieldProps={{
              select: true,
              label: i18n('badge_color_title'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
              color: getLevelFromColor(badgeColor),
              onChange: e => setBadgeColor(e.target.value),
              focused: true,
              disabled,
            }}
          >
            {Object.values(ColorLevel).map(_color => (
              <MenuItem key={_color} value={getColorFromLevel(_color)} sx={{ textTransform: 'capitalize' }}>
                {_color}
              </MenuItem>
            ))}
            <MenuItem key={'default'} value={defaultNotifications.count.color} sx={{ textTransform: 'capitalize' }}>
              {i18n('badge_color_default')}
            </MenuItem>
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('content_status_title')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={i18n('content_status_subheader')}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        sx={{ p: '0.5rem 0' }}
      />
      <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
        <Grid container spacing={1} columnSpacing={1} sx={{ justifyContent: 'center' }}>
          <CardHeader
            title={i18n('task_status_title')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            sx={{ color: 'text.secondary', padding: '1rem 0 0.25rem' }}
          />
        </Grid>
        <Grid container spacing={1} columnSpacing={1}>
          {Object.values(TaskStatus).map(s => (
            <Grid item xs={4} lg={2} key={s}>
              <Button disableTouchRipple={true} sx={{ p: '0.25rem 0 0.25rem 0.5rem' }} color={getHighlightColor(s)} disabled={disabled}>
                <FormCheckbox
                  controllerProps={{ name: 'status', control }}
                  formControlLabelProps={{
                    label: i18n(s, 'common', 'model', 'task_status'),
                    sx: { textTransform: 'capitalize', textAlign: 'start' },
                  }}
                  checkboxProps={{
                    multiple: true,
                    value: s,
                    color: getHighlightColor(s),
                    disabled,
                  }}
                />
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1} columnSpacing={1} sx={{ justifyContent: 'center' }}>
          <CardHeader
            title={i18n('download_status_title')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            sx={{ color: 'text.secondary', padding: '1rem' }}
          />
        </Grid>
        <Grid container spacing={1} columnSpacing={1}>
          {Object.values(DownloadStatus).map(s => (
            <Grid item xs={4} lg={2} key={s}>
              <Button disableTouchRipple={true} sx={{ p: '0.25rem 0 0.25rem 0.5rem' }} color={getHighlightColor(s)} disabled={disabled}>
                <FormCheckbox
                  controllerProps={{ name: 'status', control }}
                  formControlLabelProps={{
                    label: i18n(s, 'common', 'model', 'download_status'),
                    sx: { textTransform: 'capitalize', textAlign: 'start' },
                  }}
                  checkboxProps={{
                    multiple: true,
                    value: s,
                    color: getHighlightColor(s),
                    disabled,
                  }}
                />
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>
      <CardHeader
        title={i18n('direction_title')}
        subheader={i18n('direction_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'destination.enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '0.5rem 0' }}
      />
      <Collapse in={getValues()?.destination?.enabled} unmountOnExit>
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: 'clamp(12rem, 20vh, 20vh)' }}>
          <FormExplorer
            controllerProps={{ name: 'destination.folder', control }}
            explorerProps={{ flatten: true, disabled: !getValues()?.destination?.enabled }}
          />
        </Card>
      </Collapse>
    </React.Fragment>
  );
};
