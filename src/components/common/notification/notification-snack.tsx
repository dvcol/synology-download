import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, styled, SvgIconProps, Theme, Typography } from '@mui/material';

import { SnackbarKey, useSnackbar } from 'notistack';
import React, { forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useState } from 'react';

import { ColorLevel, ColorLevelMap, NotificationLevel, SnackMessage } from '@src/models';

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
  ref
) => {
  const { closeSnackbar } = useSnackbar();
  const [_expanded, setExpanded] = useState(expanded ?? false);

  useEffect(() => setExpanded(expanded ?? false), [expanded]);

  const handleExpandClick = useCallback(() => {
    setExpanded((oldExpanded) => !oldExpanded);
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
    [priority, success]
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
    <Card id={`${id}`} ref={ref} sx={{ width: '344px' }}>
      <CardHeader
        avatar={handleIcon({ sx: { fontSize: '18px' } })}
        action={
          <Box sx={{ marginLeft: 'auto' }}>
            {(message || contextMessage) && (
              <ExpandMore expand={_expanded} onClick={handleExpandClick} aria-expanded={_expanded} aria-label="show more">
                <ExpandMoreIcon sx={{ fontSize: '18px' }} />
              </ExpandMore>
            )}
            <IconButton onClick={handleDismiss}>
              <CloseIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Box>
        }
        title={<Box sx={{ overflowWrap: 'break-word', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Box>}
        titleTypographyProps={{
          variant: 'subtitle2',
          sx: { fontSize: '14px', overflow: 'hidden', width: '218px' },
        }}
        sx={{ padding: '8px 8px 8px 16px', bgcolor: handleColor() }}
      />
      {(message || contextMessage) && (
        <Collapse in={_expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ padding: '8px 8px 8px 16px !important', whiteSpace: 'pre-line' }}>
            {message && (
              <Typography variant={'body2'} sx={{ fontSize: '12px', overflowWrap: 'break-word' }}>
                {message}
              </Typography>
            )}
            {contextMessage && (
              <Typography variant={'caption'} sx={{ fontSize: '10px', color: 'darkgrey', overflowWrap: 'break-word' }}>
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
