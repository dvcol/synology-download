import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';

import type { ConfirmationState, TaskEditState, TaskItemProps } from '@src/components';
import { ConfirmationDialog, DownloadItem, TaskEdit, TaskItem } from '@src/components';

import type { Content, Download, Task } from '@src/models';
import { ContentSource } from '@src/models';
import type { StoreState } from '@src/store';
import { getContentsForActiveTab, getTabOrFirst } from '@src/store/selectors';

import { ContentEmpty } from './content-empty';

import type { ContentItemAccordionProps } from './content-item';
import type { FC } from 'react';

const ContentItemInstance: FC<{
  item: Content;
  accordion: ContentItemAccordionProps;
  hideStatus: boolean;
  setTaskEdit: TaskItemProps['setTaskEdit'];
  setConfirmation: TaskItemProps['setConfirmation'];
}> = ({ item, accordion, hideStatus, setTaskEdit, setConfirmation }) => {
  if (item.source === ContentSource.Download) {
    return <DownloadItem accordion={accordion} download={item as Download} hideStatus={hideStatus} />;
  }
  if (item.source === ContentSource.Task) {
    return <TaskItem accordion={accordion} task={item as Task} hideStatus={hideStatus} setTaskEdit={setTaskEdit} setConfirmation={setConfirmation} />;
  }
  return null;
};

export const ContentPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  const [taskEdit, setTaskEdit] = useState<TaskEditState>({ open: false });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ open: false });

  const [expanded, setExpanded] = useState<number | false>(false);

  const items = contents.map((item, index) => (
    <ContentItemInstance
      key={item.id}
      accordion={{ index, expanded, setExpanded }}
      item={item}
      hideStatus={(tab?.status?.length ?? 0) <= 1}
      setTaskEdit={setTaskEdit}
      setConfirmation={setConfirmation}
    />
  ));
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
