import { Button, Card, CardHeader, Grid, MenuItem } from '@mui/material';
import { FormInput } from './form-input';
import { ColorLevel, defaultNotifications, defaultTabs, getColorFromLevel, getLevelFromColor, Tab, TabType, TaskStatus, TaskTab } from '../../models';
import { FormCheckbox } from './form-checkbox';
import React from 'react';
import { UseFormReturn } from 'react-hook-form/dist/types/form';

export const FormTab = ({
  useFormProps: { control, getValues, reset },
  tab: { template, status, color },
  disabled,
}: React.PropsWithChildren<{
  useFormProps: Pick<UseFormReturn<Tab>, 'control' | 'getValues' | 'reset'>;
  tab: Tab;
  disabled?: boolean;
}>) => {
  const getTaskTab = (type?: TabType | string): TaskTab | undefined => defaultTabs.find((t) => t.name === type);
  const getTemplateStatuses = (taskTab?: TaskTab): TaskStatus[] => (taskTab?.status?.length ? taskTab?.status : status) ?? [];

  const [templateStatuses, setTemplateStatuses] = React.useState<TaskStatus[]>(getTemplateStatuses(getTaskTab(template)));
  const [badgeColor, setBadgeColor] = React.useState<string>(color);

  const onTemplateChange = (type: string) => {
    const tab = getTaskTab(type);
    const _status = getTemplateStatuses(tab);
    setTemplateStatuses(_status);
    const _color = getColorFromLevel(tab?.color) ?? color;
    setBadgeColor(_color);
    reset({ ...getValues(), status: _status, color: _color });
  };

  const getHighlightColor = (s: TaskStatus): ColorLevel => {
    const _color = getLevelFromColor(badgeColor);
    return _color && templateStatuses?.includes(s) ? _color : ColorLevel.primary;
  };

  return (
    <React.Fragment>
      <CardHeader
        title={'Base template'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Select a template to filter tasks status'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'template', control }}
            textFieldProps={{
              select: true,
              label: 'Template',
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
              disabled,
              onChange: (e) => onTemplateChange(e.target.value),
            }}
          >
            {Object.values(TabType).map((tab) => (
              <MenuItem key={tab} value={tab} sx={{ textTransform: 'capitalize' }}>
                {tab}
              </MenuItem>
            ))}
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={'Badge color'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Change the badge color to reflect task types.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'color', control }}
            textFieldProps={{
              select: true,
              label: 'Badge color',
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
              color: getLevelFromColor(badgeColor),
              onChange: (e) => setBadgeColor(e.target.value),
              focused: true,
              disabled,
            }}
          >
            {Object.values(ColorLevel).map((color) => (
              <MenuItem key={color} value={getColorFromLevel(color)} sx={{ textTransform: 'capitalize' }}>
                {color}
              </MenuItem>
            ))}
            <MenuItem key={'default'} value={defaultNotifications.count.color} sx={{ textTransform: 'capitalize' }}>
              Chrome Default
            </MenuItem>
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={'Task statuses'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Select statuses to include in the selection'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        sx={{ p: '0.5rem 0' }}
      />
      <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
        <Grid container spacing={1} columnSpacing={1}>
          {Object.values(TaskStatus).map((s) => (
            <Grid item xs={4} lg={2} key={s}>
              <Button disableTouchRipple={true} sx={{ p: '0 0 0 0.5rem' }} color={getHighlightColor(s)} disabled={disabled}>
                <FormCheckbox
                  controllerProps={{ name: 'status', control }}
                  formControlLabelProps={{ label: s, sx: { textTransform: 'capitalize' } }}
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
    </React.Fragment>
  );
};
