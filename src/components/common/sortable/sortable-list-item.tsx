import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Box } from '@mui/material';
import React from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import type { FC, KeyboardEventHandler, MouseEventHandler, PropsWithChildren } from 'react';

type SortableItemProps = PropsWithChildren<{ id: UniqueIdentifier; onClick?: MouseEventHandler; onKeyUp?: KeyboardEventHandler }>;
export const SortableListItem: FC<SortableItemProps> = ({ id, children, onClick, onKeyUp }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box ref={setNodeRef} style={style} onClick={onClick} onKeyUp={onKeyUp} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};
