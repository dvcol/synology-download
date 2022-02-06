import { FormInput, FormTab } from '../../common';
import { useForm, UseFormReset } from 'react-hook-form';
import { ColorLevel, ColorLevelMap, getColorFromLevel, getLevelFromColor, Tab, TaskTab } from '../../../models';
import React from 'react';
import { useDispatch } from 'react-redux';
import { AccordionDetails, Button, CardActions, CardHeader, Stack } from '@mui/material';
import { removeTaskTab, saveTaskTab } from '../../../store';
import { Control } from 'react-hook-form/dist/types/form';
import { useI18n } from '../../../utils';

export const SettingsTab = ({ tab }: { tab: TaskTab }) => {
  const i18n = useI18n('panel', 'settings', 'tab');
  const formTab = { ...tab, color: getColorFromLevel(tab.color) ?? ColorLevelMap[ColorLevel.primary] };
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
      <FormTab useFormProps={{ control: control as Control<Tab>, getValues, reset: reset as UseFormReset<Tab> }} tab={formTab} />
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
