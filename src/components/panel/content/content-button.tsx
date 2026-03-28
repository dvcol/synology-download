import type { BoxProps, ButtonProps, TooltipProps } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

import { Box, Button, Tooltip } from '@mui/material';

export interface ContentButtonProps extends PropsWithChildren {
  TooltipProps: Omit<TooltipProps, 'children'>;
  ButtonProps: ButtonProps;
  BoxProps?: Partial<BoxProps>;
}

export const ContentButton: FC<ContentButtonProps> = ({ TooltipProps, BoxProps, ButtonProps, children }) => {
  return (
    <Tooltip arrow placement="left" {...TooltipProps} PopperProps={{ disablePortal: true, ...TooltipProps?.PopperProps }}>
      <Box
        {...BoxProps}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          ...BoxProps?.sx,
        }}
      >
        <Button
          {...ButtonProps}
          sx={{
            p: '0 1rem',
            ...ButtonProps?.sx,
          }}
        >
          {children}
        </Button>
      </Box>
    </Tooltip>
  );
};
