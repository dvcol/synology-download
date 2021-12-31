import { Box, Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, styled, SvgIconProps, Theme, Typography } from '@mui/material';
import React, { forwardRef, useCallback, useState } from 'react';
import { SnackbarKey, useSnackbar } from 'notistack';
import { ColorLevel, ColorLevelMap, NotificationLevel, SnackMessage } from '../../../models';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

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

export const SnackNotificationCard = forwardRef<HTMLDivElement, { id: SnackbarKey; notification: SnackMessage }>(
  ({ id, notification: { title, message, contextMessage, priority, success } }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(false);

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
              <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
                <ExpandMoreIcon sx={{ fontSize: '18px' }} />
              </ExpandMore>
              <IconButton onClick={handleDismiss}>
                <CloseIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </Box>
          }
          title={title}
          titleTypographyProps={{ variant: 'subtitle2', sx: { fontSize: '14px' } }}
          sx={{ padding: '8px 8px 8px 16px', bgcolor: handleColor() }}
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ padding: '8px 8px 8px 16px !important' }}>
            {message && (
              <Typography variant={'body2'} sx={{ fontSize: '12px' }}>
                {message}
              </Typography>
            )}
            {contextMessage && (
              <Typography variant={'caption'} sx={{ fontSize: '10px', color: 'darkgrey' }}>
                {contextMessage}
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>
    );
  }
);
