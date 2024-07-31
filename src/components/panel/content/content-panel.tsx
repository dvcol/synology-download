import { Container } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { TransitionGroup } from 'react-transition-group';

import type { ConfirmationState, OnRefreshCallback, TaskEditState } from '@src/components';
import { ConfirmationDialog, RefreshLoader, TaskEdit, usePullToRefresh } from '@src/components';

import { SearchInput } from '@src/components/common/inputs/search-input';
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

  const onRefresh: OnRefreshCallback = () => {
    if (downloadEnabled) DownloadService.searchAll().subscribe(handleError('download', 'refresh'));
    if (logged) QueryService.listTasks().subscribe(handleError('task', 'refresh'));
  };

  const [visible, setVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');

  const loaderTop = useMemo(() => (visible ? 40 : 0), [visible]);
  const disabledFilter = useMemo(() => !!taskEdit?.task || !!confirmation?.callback, [taskEdit, confirmation]);
  const filteredContents = useMemo(() => {
    if (!visible || disabledFilter || !contents?.length || !filter?.length) return contents;
    return contents.filter(content => content.title?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase()));
  }, [contents, visible, disabledFilter, filter]);

  const { containerRef, handlers, ...loaderProps } = usePullToRefresh({ onRefresh, disabled });

  const items = (
    <TransitionGroup component={null} appear={!firstMount} enter exit>
      {filteredContents.map((item, index) => (
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
      sx={{
        height: '100%',
        overflow: 'auto',
        overscrollBehaviorY: 'contain',
        paddingTop: visible ? '2.5rem' : 0,
        transition: 'padding-top 0.2s ease-in-out',
      }}
      disableGutters
      maxWidth={false}
    >
      <SearchInput
        sx={{
          position: 'fixed',
          top: '3.125rem',
          width: '100%',
          zIndex: 100,
          display: 'flex',
          overflow: 'hidden',
          padding: visible ? '0.125rem 0.25rem 0.5rem 0.5rem' : 0,
          maxHeight: visible ? '5rem' : 0,
          transition: 'max-height 0.2s ease-in-out, padding 0.2 ease-in-out',
          backgroundColor: 'rgb(6 6 6)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))',
        }}
        containerRef={containerRef}
        containerGetter={ref => document?.querySelector<HTMLElement>('[id$="app-container"]') ?? ref.current}
        filter={filter}
        setFilter={setFilter}
        setVisible={setVisible}
        disabled={disabledFilter}
      />
      <RefreshLoader {...loaderProps} loaderTop={loaderTop} />
      {filteredContents?.length ? items : <ContentEmpty />}

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
