import { AccordionDetails, Button, CardActions, CardHeader, MenuItem, Stack } from '@mui/material';

import React from 'react';

import { useForm, UseFormReset } from 'react-hook-form';

import { Control } from 'react-hook-form/dist/types/form';

import { useDispatch } from 'react-redux';

import { FormInput, FormTab } from '@src/components';
import { ColorLevel, ColorLevelMap, getColorFromLevel, getLevelFromColor, Tab, TaskTab, TaskTabSort } from '@src/models';
import { removeTaskTab, saveTaskTab } from '@src/store/actions';
import { useI18n } from '@src/utils';

export const SettingsTab = ({ tab }: { tab: TaskTab }) => {
  const i18n = useI18n('panel', 'settings', 'tab');
  const formTab = {
    ...tab,
    color: getColorFromLevel(tab.color) ?? ColorLevelMap[ColorLevel.primary],
    destination: { ...tab.destination, folder: tab.destination?.folder ?? '' },
    sort: tab?.sort ?? TaskTabSort.creation,
    reverse: tab?.reverse ?? false,
  };
  const dispatch = useDispatch();
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<TaskTab>({ mode: 'onChange', defaultValues: formTab as TaskTab });

  const onDelete = () => dispatch(removeTaskTab(tab.id));

  const onSubmit = (form: TaskTab) => {
    dispatch(saveTaskTab({ ...form, color: getLevelFromColor(form.color) ?? ColorLevel.primary }));
    reset(form);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };
  return (
    <AccordionDetails
      sx={{
        filter: 'contrast(1.05)',
        bgcolor: 'rgba(255, 255, 255, .03)',
      }}
    >
      <CardHeader
        title={i18n('name_title')}
        subheader={i18n('name_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'name', control }}
            textFieldProps={{
              label: i18n('name_label'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
            }}
          />
        }
        sx={{ p: '0.5rem 0' }}
      />

      <CardHeader
        title={i18n('sort_title')}
        subheader={i18n('sort_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'sort', control }}
            textFieldProps={{
              select: true,
              label: i18n('sort_label'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
            }}
          >
            {Object.values(TaskTabSort).map((sort) => (
              <MenuItem key={sort} value={sort} sx={{ textTransform: 'capitalize' }}>
                {i18n(sort, 'common', 'model', 'task_tab_sort')}
              </MenuItem>
            ))}
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('reverse_title')}
        subheader={i18n('reverse_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'reverse', control }}
            textFieldProps={{
              select: true,
              label: i18n('reverse_label'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
            }}
          >
            <MenuItem key={'ascendant'} value={false as any} sx={{ textTransform: 'capitalize' }}>
              {i18n('reverse_ascendant')}
            </MenuItem>
            <MenuItem key={'descendant'} value={true as any} sx={{ textTransform: 'capitalize' }}>
              {i18n('reverse_descendant')}
            </MenuItem>
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <FormTab useFormProps={{ control: control as unknown as Control<Tab>, getValues, reset: reset as UseFormReset<Tab> }} tab={formTab} />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="error" sx={{ width: '5rem' }} type="submit" onClick={onDelete}>
            {i18n('delete', 'common', 'buttons')}
          </Button>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </AccordionDetails>
  );
};
