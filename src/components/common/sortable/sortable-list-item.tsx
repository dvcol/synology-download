import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Box } from '@mui/material';

import React from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import type { BoxProps } from '@mui/material';
import type { FC, MouseEventHandler, PropsWithChildren } from 'react';

type SortableItemProps = PropsWithChildren<{ id: UniqueIdentifier; box?: BoxProps; onClick?: MouseEventHandler }>;
export const SortableListItem: FC<SortableItemProps> = ({ id, box, children, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box {...box} ref={setNodeRef} style={style} onClick={onClick} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};
