import { Container } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { TransitionGroup } from 'react-transition-group';

import type { ConfirmationState, Options, TaskEditState } from '@src/components';
import { ConfirmationDialog, TaskEdit, usePullToRefresh } from '@src/components';

import { ContentItemInstance } from '@src/components/panel/content/content-item-instance';
import type { Content } from '@src/models';
import { ErrorType, LoginError } from '@src/models';
import { DownloadService, NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getContentsForActiveTab, getInterfacePullToRefresh, getLogged, getSettingsDownloadsEnabled, getTabOrFirst } from '@src/store/selectors';

import { useI18n } from '@src/utils';

import { ContentEmpty } from './content-empty';

let firstMount = true;

export const ContentPanel = () => {
  const i18n = useI18n('content', 'panel');
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  const [taskEdit, setTaskEdit] = useState<TaskEditState>({ open: false });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ open: false });

  const [expanded, setExpanded] = useState<number | false>(false);

  useEffect(() => {
    if (firstMount) firstMount = false;
    setExpanded(false);
  }, [tab]);

  const handleError = (type: 'task' | 'download', action: string) => ({
    error: (error: any) => {
      if (error instanceof LoginError || ErrorType.Login === error?.type) {
        NotificationService.loginRequired();
      } else if (error) {
        NotificationService.error({
          title: i18n(`${type}_${action}_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
      }
    },
  });

  const logged = useSelector(getLogged);
  const downloadEnabled = useSelector(getSettingsDownloadsEnabled);
  const pullToRefreshEnabled = useSelector(getInterfacePullToRefresh);
  const disabled = useRef<boolean>(!pullToRefreshEnabled || (!logged && !downloadEnabled));

  const onRefresh: Options['onRefresh'] = () => {
    if (downloadEnabled) DownloadService.searchAll().subscribe(handleError('download', 'refresh'));
    if (logged) QueryService.listTasks().subscribe(handleError('task', 'refresh'));
  };
  const { containerRef, handlers, Loader } = usePullToRefresh({ onRefresh, disabled });

  const items = (
    <TransitionGroup component={null} appear={!firstMount} enter exit>
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
    <Container
      id="content-container"
      ref={containerRef}
      {...handlers}
      sx={{ height: '100%', overflow: 'auto', overscrollBehaviorY: 'contain' }}
      disableGutters
    >
      {Loader}
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
    </Container>
  );
};

export default ContentPanel;
