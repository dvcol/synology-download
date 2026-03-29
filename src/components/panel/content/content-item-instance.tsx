import type { FC, Ref } from 'react';
import type { TransitionStatus } from 'react-transition-group';
import type { CSSTransitionProps } from 'react-transition-group/CSSTransition';

import type { Content } from '../../../models/content.model';
import type { Download } from '../../../models/download.model';
import type { Task } from '../../../models/task.model';
import type { ContentItemAccordionProps } from './content-item';
import type { TaskItemProps } from './task/task-item';

import { styled } from '@mui/material';
import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import { ContentSource } from '../../../models/content.model';
import { slideDownAnimation, slideOutAnimation } from '../../../utils/animations.utils';
import { DownloadItem } from './downloads/download-item';
import { TaskItem } from './task/task-item';

interface ItemComponentProps {
  item: Content;
  accordion: ContentItemAccordionProps;
  hideStatus: boolean;
  setTaskEdit: TaskItemProps['setTaskEdit'];
  setConfirmation: TaskItemProps['setConfirmation'];
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
function ItemComponent({
  item,
  accordion,
  hideStatus,
  setTaskEdit,
  setConfirmation,
  className,
  ref,
}: ItemComponentProps) {
  if (item.source === ContentSource.Download) {
    return <DownloadItem ref={ref} className={className} accordion={accordion} download={item as Download} hideStatus={hideStatus} />;
  }
  if (item.source === ContentSource.Task) {
    return (
      <TaskItem
        ref={ref}
        className={className}
        accordion={accordion}
        task={item as Task}
        hideStatus={hideStatus}
        setTaskEdit={setTaskEdit}
        setConfirmation={setConfirmation}
      />
    );
  }
  return null;
}

const duration = { enter: 300, exit: 300 };
const STAGGER = 50;
interface StylingProps { state: TransitionStatus; index: number }
const StyledItemComponent = styled(ItemComponent)<StylingProps>`
  z-index: 0;
  animation-fill-mode: both;

  &.slide-appear,
  &.slide-enter {
    animation-name: ${slideDownAnimation};
    animation-duration: ${duration.enter}ms;
    animation-timing-function: ease-in-out;
  }

  &.slide-enter-done {
    z-index: 1;
  }

  &.slide-exit {
    animation-name: ${slideOutAnimation};
    animation-duration: ${duration.exit}ms;
    animation-timing-function: ease-in-out;
    transition: max-height ${duration.exit}ms ease-in-out;
  }
`;

type ItemTransitionProps = { content: ItemComponentProps & Pick<StylingProps, 'index'> } & Partial<CSSTransitionProps>;
const TransitionComponent: FC<ItemTransitionProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { content, ..._props } = props;
  const { index, item } = content;
  return (
    <CSSTransition
      key={item.key ?? item.id}
      classNames="slide"
      nodeRef={ref}
      timeout={{ ...duration, appear: duration.enter + index * STAGGER }}
      unmountOnExit
      {..._props}
    >
      {state => <StyledItemComponent ref={ref} state={state} {...content} />}
    </CSSTransition>
  );
};

export const ContentItemInstance = TransitionComponent;
