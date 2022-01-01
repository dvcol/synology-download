import { AccordionDetails, Box, Button, Card, CardActions, CardHeader, ListItemIcon, ListItemText, MenuItem, Stack } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { removeQuickMenu, saveQuickMenu } from '../../../store';
import { QuickMenu } from '../../../models/quick-menu.model';
import { useForm } from 'react-hook-form';
import { FormExplorer, FormInput, FormSwitch } from '../../form';
import { MuiIcon } from '../../ui-element';
import { MaterialIcon, MaterialIconMap } from '../../../models';

export const SettingsMenu = ({ menu }: { menu: QuickMenu }) => {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<QuickMenu>({ mode: 'onChange', defaultValues: menu });

  const onDelete = () => dispatch(removeQuickMenu(menu.id));

  const onSubmit = (form: QuickMenu) => {
    dispatch(saveQuickMenu(form));
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
        title={'Quick menu name'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Change the name of the quick menu.'}
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
        title={'Menu icon'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={'Change the shortcut menu icon.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'icon', control }}
            textFieldProps={{
              select: true,
              label: 'Icon',
              sx: { flex: '1 0 8rem' },
            }}
          >
            {Object.values(MaterialIcon).map((icon) => (
              <MenuItem key={icon} value={icon}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <ListItemIcon sx={{ alignItems: 'center', minWidth: '36px', pl: '8px' }}>
                    <MuiIcon icon={icon} props={{ sx: { fontSize: '18px' } }} />
                  </ListItemIcon>
                  <ListItemText primary={MaterialIconMap[icon]} primaryTypographyProps={{ sx: { fontSize: '12px' } }} />
                </Box>
              </MenuItem>
            ))}
          </FormInput>
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
      <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '16rem' }}>
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
