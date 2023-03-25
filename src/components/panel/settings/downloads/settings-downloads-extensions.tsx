import AddIcon from '@mui/icons-material/Add';
import { Button, Grid } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { FormInput } from '@src/components';
import type { DownloadExtension } from '@src/models';
import { useI18n } from '@src/utils';

import type { FC } from 'react';

const empty: DownloadExtension = { ext: '', mime: '' };

export const SettingsDownloadsExtensions: FC<{ addExtension: (extension: DownloadExtension) => void; extensions?: DownloadExtension[] }> = ({
  addExtension,
  extensions,
}) => {
  const i18n = useI18n('panel', 'settings', 'downloads', 'extensions');

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<DownloadExtension>({
    mode: 'onChange',
    defaultValues: empty,
  });

  const onSubmit = ({ ext, mime }: DownloadExtension) => {
    addExtension({ ext, mime: mime?.length ? mime : undefined });
    reset(empty);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  return (
    <Grid container spacing={1} columnSpacing={1} sx={{ p: '1.5rem 0.25rem 0.5rem 0.75rem', gap: '1rem', alignItems: 'flex-start' }}>
      <FormInput
        controllerProps={{
          name: 'ext',
          control,
          rules: {
            required: i18n('required'),
            minLength: { value: 2, message: i18n('min_length') },
            validate: (ext: string) => ext.startsWith('.') || i18n('starts_with'),
          },
        }}
        textFieldProps={{
          type: 'text',
          label: i18n('ext'),
          sx: { flex: '1 1 auto' },
        }}
      />
      <FormInput
        controllerProps={{
          name: 'mime',
          control,
          rules: {
            validate: async (mime?: string) =>
              !extensions?.some(e => e.ext === getValues()?.ext && (e.mime ?? '') === (mime ?? '')) || i18n('duplicate'),
          },
        }}
        textFieldProps={{
          type: 'text',
          label: i18n('mime'),
          sx: { flex: '1 1 auto' },
        }}
      />
      <Button
        variant="outlined"
        color={onSubmitColor()}
        sx={{ minHeight: '3rem' }}
        type="submit"
        disabled={!isValid}
        onClick={handleSubmit(onSubmit)}
        startIcon={<AddIcon />}
      >
        {i18n('add', 'common', 'buttons')}
      </Button>
    </Grid>
  );
};
