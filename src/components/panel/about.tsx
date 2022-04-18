import GitHubIcon from '@mui/icons-material/GitHub';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import SecurityIcon from '@mui/icons-material/Security';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

import { Button, Card, CardActions, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { getAcceptLanguages, useI18n } from '@dvcol/web-extension-utils';

import manifest from '@src/manifest.json';
import { AppLinks } from '@src/models';
import { createTab } from '@src/utils';

import type { CardProps } from '@mui/material';
import type { FC } from 'react';

export const About: FC<{
  cardProps?: CardProps;
}> = ({ cardProps }) => {
  const i18n = useI18n('panel', 'about');

  const [languages, setLanguages] = useState<string[]>();
  useEffect(() => {
    const sub = getAcceptLanguages().subscribe(_languages => setLanguages(_languages));
    return () => sub.unsubscribe();
  }, []);

  return (
    <Card raised={true} {...cardProps}>
      <CardHeader
        title={i18n('title')}
        subheader={
          <Stack gap={1} direction={'row'} sx={{ m: '0.5rem 0 0.2rem' }}>
            <Chip color="primary" size="small" label={`${i18n('chip_version')}: ${manifest.version}`} sx={{ height: '1.1rem' }} />
            <Chip color="success" size="small" label={`${i18n('chip_supported_languages')}: en`} sx={{ height: '1.1rem' }} />
            {languages && (
              <Chip
                color="secondary"
                size="small"
                label={`${i18n('chip_user_languages')}: ${languages.filter(lang => !lang.includes('-')).join(', ')}`}
                sx={{ height: '1.1rem' }}
              />
            )}
          </Stack>
        }
        titleTypographyProps={{ variant: 'h5', color: 'text.primary' }}
        subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '14px' }}
        sx={{ p: '16px 16px 0', textTransform: 'capitalize' }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: '8px 16px 16px' }}>
        <Typography gutterBottom variant="h5" component="div">
          {i18n('description_title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('description_body_p1')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('description_body_p2')}
        </Typography>

        <Typography gutterBottom variant="h5" component="div">
          {i18n('limitations_title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('limitations_body_p1')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('limitations_body_p2')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('limitations_body_p3')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n('limitations_body_p4')}
        </Typography>

        <Typography gutterBottom variant="h5" component="div">
          {i18n('contribute_title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {i18n('contribute_body')}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-around', p: '0 1rem 1rem' }}>
        <Button
          variant="outlined"
          color="info"
          onClick={() => createTab({ url: AppLinks.Webstore })}
          startIcon={<LocalGroceryStoreIcon />}
          sx={{ flex: '0 1 8rem' }}
        >
          {i18n('button_store')}
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={() => createTab({ url: AppLinks.Privacy })}
          startIcon={<SecurityIcon />}
          sx={{ flex: '0 1 8rem' }}
        >
          {i18n('button_privacy')}
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => createTab({ url: AppLinks.Issues })}
          startIcon={<LiveHelpIcon />}
          sx={{ flex: '0 1 8rem' }}
        >
          {i18n('button_support')}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => createTab({ url: AppLinks.Github })}
          startIcon={<GitHubIcon />}
          sx={{ flex: '0 1 8rem' }}
        >
          {i18n('button_contribute')}
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={() => createTab({ url: AppLinks.Paypal })}
          startIcon={<VolunteerActivismIcon />}
          sx={{ flex: '0 1 8rem' }}
        >
          {i18n('button_donate')}
        </Button>
      </CardActions>
    </Card>
  );
};
