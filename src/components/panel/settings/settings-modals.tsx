import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { InterfaceHeader } from '../../../models';

export const SettingsModal = () => {
  const title = InterfaceHeader.modals;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>Modal settings</CardContent>
    </Card>
  );
};
