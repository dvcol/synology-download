import { AccordionDetails, Button, Card, CardActions, CardHeader, Stack } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { removeContextMenu, saveContextMenu } from '../../../store';
import { ChromeMessageType, ContextMenu } from '../../../models';
import { useForm } from 'react-hook-form';
import { FormExplorer, FormInput, FormSwitch } from '../../form';
import { sendMessage } from '../../../utils';

export const SettingsContextMenu = ({ menu }: { menu: ContextMenu }) => {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<ContextMenu>({ mode: 'onChange', defaultValues: menu });

  const onDelete = () => {
    sendMessage<string>({ type: ChromeMessageType.removeMenu, payload: menu.id }).subscribe(() => dispatch(removeContextMenu(menu.id)));
  };

  const onSubmit = (form: ContextMenu) => {
    sendMessage<ContextMenu>({ type: ChromeMessageType.updateMenu, payload: form }).subscribe(() => {
      dispatch(saveContextMenu(form));
      reset(form);
    });
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
        title={'Context menu name'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Change the name of the context menu.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'title', control }}
            textFieldProps={{
              label: 'Menu name',
              sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
            }}
          />
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={'Open full modal'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Toggle to open full modal instead of shortcut.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'modal', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={'Destination folder'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Change default destination folder.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '0.5rem 0' }}
      />
      <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '12rem' }}>
        <FormExplorer
          controllerProps={{ name: 'destination.path', control }}
          explorerProps={{ flatten: true, disabled: !getValues()?.destination?.custom, startPath: menu?.destination?.path }}
        />
      </Card>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="error" sx={{ width: '5rem' }} type="submit" onClick={onDelete}>
            Delete
          </Button>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </Stack>
      </CardActions>
    </AccordionDetails>
  );
};
