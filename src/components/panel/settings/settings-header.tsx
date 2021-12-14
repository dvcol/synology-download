import { SettingHeader } from '../../../models';
import { Typography } from '@mui/material';
import React from 'react';

export const SettingsHeader = ({ label }: { label: SettingHeader }) => (
  <Typography id={label} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
    {label}
  </Typography>
);
