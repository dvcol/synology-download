import React, { Fragment, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { TransitionGroup } from 'react-transition-group';

import type { ConfirmationState, TaskEditState } from '@src/components';
import { ConfirmationDialog, TaskEdit } from '@src/components';

import { ContentItemInstance } from '@src/components/panel/content/content-item-instance';
import type { Content } from '@src/models';
import type { StoreState } from '@src/store';
import { getContentsForActiveTab, getTabOrFirst } from '@src/store/selectors';

import { ContentEmpty } from './content-empty';

let firstMount = true;

export const ContentPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  const [taskEdit, setTaskEdit] = useState<TaskEditState>({ open: false });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ open: false });

  const [expanded, setExpanded] = useState<number | false>(false);

  useEffect(() => {
    if (firstMount) firstMount = false;
    console.info(tab?.name);
    setExpanded(false);
  }, [tab]);

  const items = (
    <TransitionGroup component={null} appear enter exit>
      {contents.map((item, index) => (
        <ContentItemInstance
          key={item.key ?? item.id}
          content={{
            index,
            item,
            accordion: { index, expanded, setExpanded },
            hideStatus: (tab?.status?.length ?? 0) <= 1,
            setTaskEdit,
            setConfirmation,
          }}
        />
      ))}
    </TransitionGroup>
  );
  return (
    <Fragment>
      {contents?.length ? items : <ContentEmpty />}

      {taskEdit?.task && (
        <TaskEdit
          open={taskEdit.open}
          task={taskEdit.task}
          onFormCancel={() => setTaskEdit(current => ({ ...current, open: false }))}
          onFormSubmit={() => setTaskEdit(current => ({ ...current, open: false }))}
        />
      )}

      {!!confirmation?.callback && (
        <ConfirmationDialog
          open={confirmation.open}
          title={confirmation.title}
          description={confirmation.description}
          onCancel={() => setConfirmation(current => ({ ...current, open: false }))}
          onConfirm={() => {
            setConfirmation(current => ({ ...current, open: false }));
            confirmation.callback?.();
          }}
        />
      )}
    </Fragment>
  );
};

export default ContentPanel;
