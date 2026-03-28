import type { SettingHeader } from '../../../models/settings.model';

import { Typography } from '@mui/material';
import React from 'react';

import { useI18n } from '../../../utils/webex.utils';

export function SettingsHeader({ label }: { label: SettingHeader }) {
  const i18n = useI18n('panel', 'settings');
  return (
    <Typography id={label} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
      {i18n(label)}
    </Typography>
  );
}
