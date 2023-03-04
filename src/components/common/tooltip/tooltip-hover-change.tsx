import { Box, Tooltip } from '@mui/material';

import React, { useState } from 'react';

import type { ModifiedEvent } from '@src/models';

import type { BoxProps, TooltipProps } from '@mui/material';
import type { FC } from 'react';

export type TooltipHoverChangeProps = {
  title?: string;
  hoverTooltip?: ($event: ModifiedEvent) => string | undefined;
  props?: Omit<TooltipProps, 'title' | 'children'>;
  boxProps?: BoxProps;
};

export const TooltipHoverChange: FC<TooltipHoverChangeProps> = ({ title, hoverTooltip, children, props, boxProps }) => {
  const [tooltip, setTooltip] = useState<string | undefined>(title);

  const onEvent = ($event: ModifiedEvent) => {
    if (hoverTooltip) setTooltip(hoverTooltip($event));
  };
  return (
    <Tooltip title={tooltip ?? ''} {...props}>
      <Box {...boxProps} onMouseOver={onEvent} onKeyUp={onEvent} onKeyDown={onEvent}>
        {children}
      </Box>
    </Tooltip>
  );
};

export default TooltipHoverChange;
