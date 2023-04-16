import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import React, { useEffect, useState } from 'react';

import { TransitionGroup } from 'react-transition-group';

import { SortableListItemTransition } from './sortable-list-transition';

import type { DndContextProps, UniqueIdentifier } from '@dnd-kit/core';
import type { BoxProps } from '@mui/material';
import type { MouseEvent } from 'react';

type SortableValue = { id: UniqueIdentifier; [key: string]: any };

type SortableListProps<T extends SortableValue> = {
  values: T[];
  render: (value: T, index: number) => JSX.Element;
  context?: DndContextProps;
  box?: BoxProps;
  onClick?: (event: MouseEvent, value: T) => void;
  onChange?: (values: T[]) => void;
  disabled?: boolean;
};

export const SortableList = <T extends SortableValue>({ values, render, context, box, onClick, onChange, disabled }: SortableListProps<T>) => {
  const [_values, _setValues] = useState(values);

  useEffect(() => _setValues(values), [values]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 25 },
    }),
  );

  const handleDragEnd: DndContextProps['onDragEnd'] = ({ active, over }) => {
    if (over && active.id !== over.id) {
      _setValues(items => {
        const oldIndex = items.findIndex(_item => _item.id === active.id);
        const newIndex = items.findIndex(_item => _item.id === over.id);

        const mutatedArray = arrayMove(items, oldIndex, newIndex);
        onChange?.(mutatedArray);
        return mutatedArray;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      {...context}
    >
      <SortableContext items={_values} strategy={verticalListSortingStrategy} disabled={disabled}>
        <TransitionGroup component={null} enter exit>
          {_values.map((value, index) => (
            <SortableListItemTransition
              key={value.id}
              item={{
                id: value.id,
                index,
                box,
                onClick: e => onClick?.(e, value),
              }}
            >
              {render(value, index)}
            </SortableListItemTransition>
          ))}
        </TransitionGroup>
      </SortableContext>
    </DndContext>
  );
};
