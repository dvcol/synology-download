import { Box, Button, Tooltip } from '@mui/material';

import React from 'react';

import type { BoxProps, ButtonProps, TooltipProps } from '@mui/material';

import type { FC } from 'react';

export type ContentButtonProps = {
  TooltipProps: Omit<TooltipProps, 'children'>;
  ButtonProps: ButtonProps;
  BoxProps?: Partial<BoxProps>;
};

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
