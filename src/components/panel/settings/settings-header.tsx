import { Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { SettingHeader } from '@src/models';

export const SettingsHeader = ({ label }: { label: SettingHeader }) => {
  const i18n = useI18n('panel', 'settings');
  return (
    <Typography id={label} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
      {i18n(label)}
    </Typography>
  );
};
