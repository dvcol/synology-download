import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { Box, Card, CardContent, CardHeader, Collapse, IconButton, styled, Typography } from '@mui/material';

import { useSnackbar } from 'notistack';

import React, { forwardRef, useCallback, useEffect, useState } from 'react';

import type { SnackMessage } from '@src/models';
import { ColorLevel, ColorLevelMap, NotificationLevel } from '@src/models';

import type { IconButtonProps, SvgIconProps, Theme } from '@mui/material';
import type { SnackbarKey } from 'notistack';
import type { ForwardRefRenderFunction } from 'react';

const ExpandMore = styled(({ expand, ...other }: IconButtonProps & { expand: boolean }) => <IconButton {...other} />)<{
  theme?: Theme;
  expand: boolean;
}>(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

type SnackNotificationCardProps = { id: SnackbarKey; notification: SnackMessage; expanded?: boolean };
const SnackNotificationCardComponent: ForwardRefRenderFunction<HTMLDivElement, SnackNotificationCardProps> = (
  { id, notification: { title, message, contextMessage, priority, success }, expanded },
  ref,
) => {
  const { closeSnackbar } = useSnackbar();
  const [_expanded, setExpanded] = useState(expanded ?? false);

  useEffect(() => setExpanded(expanded ?? false), [expanded]);

  const handleExpandClick = useCallback(() => {
    setExpanded(oldExpanded => !oldExpanded);
  }, []);

  const handleDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  const handleIcon = useCallback(
    (props?: SvgIconProps): JSX.Element => {
      switch (priority) {
        case NotificationLevel.error:
          return <CancelOutlinedIcon {...props} />;
        case NotificationLevel.warn:
          return <WarningAmberIcon {...props} />;
        case NotificationLevel.debug:
        case NotificationLevel.trace:
          return <BugReportOutlinedIcon {...props} />;
        case NotificationLevel.info:
        default:
          return success ? <CheckCircleOutlinedIcon {...props} /> : <InfoOutlinedIcon {...props} />;
      }
    },
    [priority, success],
  );

  const handleColor = useCallback((): string | undefined => {
    switch (priority) {
      case NotificationLevel.error:
        return ColorLevelMap[ColorLevel.error];
      case NotificationLevel.warn:
        return ColorLevelMap[ColorLevel.warning];
      case NotificationLevel.info:
        return success ? ColorLevelMap[ColorLevel.success] : ColorLevelMap[ColorLevel.info];
      case NotificationLevel.debug:
      case NotificationLevel.trace:
        return ColorLevelMap[ColorLevel.secondary];
      default:
    }
  }, [priority, success]);

  return (
    <Card id={`${id}`} ref={ref} sx={{ width: '21.5rem' }}>
      <CardHeader
        avatar={handleIcon({ sx: { fontSize: '1.125rem' } })}
        action={
          <Box sx={{ marginLeft: 'auto' }}>
            {(message || contextMessage) && (
              <ExpandMore expand={_expanded} onClick={handleExpandClick} aria-expanded={_expanded} aria-label="show more">
                <ExpandMoreIcon sx={{ fontSize: '1.125rem' }} />
              </ExpandMore>
            )}
            <IconButton onClick={handleDismiss}>
              <CloseIcon sx={{ fontSize: '1.125rem' }} />
            </IconButton>
          </Box>
        }
        title={<Box sx={{ overflowWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Box>}
        titleTypographyProps={{
          variant: 'subtitle2',
          sx: { fontSize: '0.875rem', overflow: 'hidden', width: '13.625rem' },
        }}
        sx={{ padding: '0.5rem 0.5rem 0.5rem 1rem', bgcolor: handleColor() }}
      />
      {(message || contextMessage) && (
        <Collapse in={_expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ padding: '0.5rem 0.5rem 0.5rem 1rem !important', whiteSpace: 'pre-line' }}>
            {message && (
              <Typography variant={'body2'} sx={{ fontSize: '0.75rem', overflowWrap: 'break-word' }}>
                {message}
              </Typography>
            )}
            {contextMessage && (
              <Typography variant={'caption'} sx={{ fontSize: '0.625rem', color: 'darkgrey', overflowWrap: 'break-word' }}>
                {contextMessage}
              </Typography>
            )}
          </CardContent>
        </Collapse>
      )}
    </Card>
  );
};

export const SnackNotificationCard = forwardRef(SnackNotificationCardComponent);
