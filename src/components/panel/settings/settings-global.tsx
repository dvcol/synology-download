import { Button, Card, CardActions, CardContent, CardHeader, MenuItem, Stack } from '@mui/material';
import { getGlobal } from '@src/store/selectors';
import { Global, InterfaceHeader, ThemeMode } from '@src/models';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormInput } from '@src/components';
import { useI18n } from '@src/utils';
import { useForm } from 'react-hook-form';
import { StoreState } from '@src/store';
import { syncInterface } from '@src/store/actions';

export const SettingsGlobal = () => {
  const i18n = useI18n('panel', 'settings', 'global');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, Global>(getGlobal);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<Global>({ mode: 'onChange', defaultValues: { ...state, theme: state.theme ?? ThemeMode.auto } });

  const onSubmit = (data: Global) => {
    dispatch(syncInterface(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={InterfaceHeader.global}
        title={i18n('title')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheader={i18n('subheader')}
        subheaderTypographyProps={{ color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          id={InterfaceHeader.global}
          title={i18n('theme_title')}
          subheader={i18n('theme_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'theme', control }}
              textFieldProps={{
                select: true,
                label: i18n('theme_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
              }}
            >
              {Object.values(ThemeMode).map((theme) => (
                <MenuItem key={theme} value={theme} sx={{ textTransform: 'capitalize' }}>
                  {i18n(theme, 'common', 'model', 'theme_mode')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
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
    </Card>
  );
};
