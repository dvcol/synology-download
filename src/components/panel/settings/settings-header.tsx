import { SettingHeader } from '../../../models';
import { InView } from 'react-intersection-observer';
import { Typography } from '@mui/material';
import React from 'react';

export const SettingsHeader = ({ label, onChange }: { label: SettingHeader; onChange: (label: string, inView: boolean) => void }) => (
  <InView as="div" threshold={0} onChange={(inView) => onChange(label, inView)}>
    <Typography id={label} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
      {label}
    </Typography>
  </InView>
);
