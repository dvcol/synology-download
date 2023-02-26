import { Avatar, Grid, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

import { blue } from '@mui/material/colors';

import React from 'react';

import type { ProgressBarProps } from '@src/components';
import { ProgressBar } from '@src/components';

import type { AvatarProps } from '@mui/material';
import type { FC } from 'react';

type ContentCardProps = {
  title: string;
  icon: JSX.Element;
  iconBackground?: string;
  iconVariant?: AvatarProps['variant'];
  description: JSX.Element;
  progress?: JSX.Element;
  progressBar?: ProgressBarProps;
  expanded?: boolean;
};
export const ContentCard: FC<ContentCardProps> = ({ title, icon, iconBackground, iconVariant, description, progress, progressBar, expanded }) => {
  return (
    <ListItem sx={{ minWidth: '40rem', padding: '0.5rem 1rem' }} dense={true}>
      <ListItemAvatar sx={{ minWidth: '4.125rem' }}>
        <Avatar sx={{ width: '3.125rem', height: '3.125rem', bgcolor: iconBackground ?? blue[100] }} variant={iconVariant ?? 'circular'}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{ maxWidth: '100vw', whiteSpace: 'nowrap' }}
        primary={title}
        primaryTypographyProps={{
          component: 'span',
          sx: {
            maxWidth: expanded ? '100%' : 'calc(100vw - 8.5rem)',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'non' : '3',
            WebkitBoxOrient: 'vertical',
          },
        }}
        secondary={
          <React.Fragment>
            <Grid container>
              <Grid item xs={10}>
                {description}
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {progress ?? ''}
              </Grid>
            </Grid>
            {!!progressBar && <ProgressBar {...progressBar} />}
          </React.Fragment>
        }
        secondaryTypographyProps={{
          component: 'span',
          variant: 'caption',
          color: 'text.secondary',
          sx: { display: 'inline' },
        }}
      />
    </ListItem>
  );
};
