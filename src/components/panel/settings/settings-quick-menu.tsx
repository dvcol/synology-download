import { AccordionDetails, Box, Button, Card, CardActions, CardHeader, Collapse, ListItemIcon, ListItemText, MenuItem, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormExplorer, FormInput, FormSwitch, MuiIcon } from '@src/components/common';
import type { QuickMenu } from '@src/models';
import { MaterialIcon, MaterialIconMap, QuickMenuType } from '@src/models';
import { removeQuickMenu, saveQuickMenu } from '@src/store/actions';

export const SettingsQuickMenu = ({ menu }: { menu: QuickMenu }) => {
  const i18n = useI18n('panel', 'settings', 'quick_menu');
  const dispatch = useDispatch();
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<QuickMenu>({
    mode: 'onChange',
    defaultValues: {
      ...menu,
      modal: menu.modal ?? false,
      destination: { custom: menu.destination?.custom ?? false, path: menu.destination?.path ?? '' },
      type: menu.type ?? QuickMenuType.Download,
    },
  });

  const onDelete = () => dispatch(removeQuickMenu(menu.id));

  const onSubmit = (form: QuickMenu) => {
    dispatch(saveQuickMenu(form));
    reset(form, { keepIsSubmitted: true, keepSubmitCount: true });
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
              sx: { flex: '0 0 12rem', textTransform: 'capitalize' },
            }}
          />
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('icon_title')}
        subheader={i18n('icon_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'icon', control }}
            textFieldProps={{
              select: true,
              label: i18n('icon_label'),
              sx: { flex: '0 0 12rem' },
            }}
          >
            {Object.values(MaterialIcon).map(icon => (
              <MenuItem key={icon} value={icon}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <ListItemIcon sx={{ alignItems: 'center', minWidth: '2.25rem', pl: '0.5rem' }}>
                    <MuiIcon icon={icon} props={{ sx: { fontSize: '1.125rem' } }} />
                  </ListItemIcon>
                  <ListItemText primary={MaterialIconMap[icon]} primaryTypographyProps={{ sx: { fontSize: '0.75rem' } }} />
                </Box>
              </MenuItem>
            ))}
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />
      <CardHeader
        title={i18n('type_title')}
        subheader={i18n('type_subheader')}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={
          <FormInput
            controllerProps={{ name: 'type', control }}
            textFieldProps={{
              select: true,
              label: i18n('type_label'),
              sx: { flex: '0 0 12rem' },
            }}
          >
            {Object.values(QuickMenuType).map(type => (
              <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                {i18n(type, 'common', 'model', 'quick_menu_type')}
              </MenuItem>
            ))}
          </FormInput>
        }
        sx={{ p: '0.5rem 0' }}
      />

      <Collapse in={getValues()?.type === QuickMenuType.Recent} unmountOnExit>
        <CardHeader
          title={i18n('max_title')}
          subheader={i18n('max_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'max', control, rules: { min: 0, max: 20 } }}
              textFieldProps={{
                type: 'number',
                label: i18n('max_label'),
                disabled: getValues()?.type !== QuickMenuType.Recent,
                sx: { flex: '0 0 12rem', ml: '0.5rem' },
              }}
            />
          }
          sx={{ p: '0.5rem 0', mt: '0.5rem' }}
        />
      </Collapse>

      <Collapse in={getValues()?.type === QuickMenuType.Task} unmountOnExit>
        <CardHeader
          title={i18n('modal_title')}
          subheader={i18n('modal_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormSwitch
              controllerProps={{ name: 'modal', control }}
              formControlLabelProps={{ label: '', disabled: getValues()?.type !== QuickMenuType.Task }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('destination_title')}
          subheader={i18n('destination_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormSwitch
              controllerProps={{ name: 'destination.custom', control }}
              formControlLabelProps={{ label: '', disabled: getValues()?.type !== QuickMenuType.Task }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
        <Collapse in={getValues()?.destination?.custom} unmountOnExit>
          <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '12rem' }}>
            <FormExplorer
              controllerProps={{ name: 'destination.path', control }}
              explorerProps={{
                flatten: true,
                disabled: !getValues()?.destination?.custom || getValues()?.type !== QuickMenuType.Task,
                startPath: menu?.destination?.path,
              }}
            />
          </Card>
        </Collapse>
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
