import { AccordionDetails, Button, Card, CardActions, CardHeader, Collapse, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch } from 'react-redux';

import { FormExplorer, FormInput, FormSwitch } from '@src/components/common';
import type { ContextMenu } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { removeContextMenu, saveContextMenu } from '@src/store/actions';
import { useI18n, sendMessage } from '@src/utils';

export const SettingsContextMenu = ({ menu }: { menu: ContextMenu }) => {
  const i18n = useI18n('panel', 'settings', 'context_menu');
  const dispatch = useDispatch();
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<ContextMenu>({
    mode: 'onChange',
    defaultValues: {
      ...menu,
      modal: menu.modal ?? false,
      destination: { custom: menu.destination?.custom ?? false, path: menu.destination?.path ?? '' },
    },
  });

  const onDelete = () => {
    sendMessage<string>({ type: ChromeMessageType.removeMenu, payload: menu.id }).subscribe(() => dispatch(removeContextMenu(menu.id)));
  };

  const onSubmit = (form: ContextMenu) => {
    sendMessage<ContextMenu>({ type: ChromeMessageType.updateMenu, payload: form }).subscribe(() => {
      dispatch(saveContextMenu(form));
      reset(form, { keepIsSubmitted: true, keepSubmitCount: true });
    });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
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
            controllerProps={{ name: 'title', control }}
            textFieldProps={{
              label: i18n('name_label'),
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
            }}
          />
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('modal_title')}
        subheader={i18n('modal_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'modal', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('destination_title')}
        subheader={i18n('destination_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '0.5rem 0' }}
      />
      <Collapse in={getValues()?.destination?.custom} unmountOnExit>
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '12rem' }}>
          <FormExplorer
            controllerProps={{ name: 'destination.path', control }}
            explorerProps={{
              flatten: true,
              disabled: !getValues()?.destination?.custom,
              startPath: menu?.destination?.path,
            }}
          />
        </Card>
      </Collapse>
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
