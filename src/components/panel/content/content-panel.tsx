import type { Content } from '../../../models/content.model';
import type { StoreState } from '../../../store/store';
import type { SearchInputRef } from '../../common/inputs/search-input';
import type { OnRefreshCallback } from '../../utils/use-pull-to-refresh';
import type { ConfirmationState, TaskEditState } from './task/task-detail';

import { Container, MenuItem } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';

import { ErrorType, LoginError } from '../../../models/error.model';
import { DownloadService } from '../../../services/download/download.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { PanelService } from '../../../services/panel/panel.service';
import { QueryService } from '../../../services/query/query.service';
import { getContentsForActiveTab, getTabOrFirst } from '../../../store/selectors/composite.selector';
import { getInterfacePullToRefresh, getSettingsDownloadsEnabled } from '../../../store/selectors/settings.selector';
import { getLogged } from '../../../store/selectors/state.selector';
import { useI18n } from '../../../utils/webex.utils';
import { ConfirmationDialog } from '../../common/dialog/confirmation-dialog';
import { SearchInput } from '../../common/inputs/search-input';
import { RefreshLoader } from '../../utils/pull-to-refresh';
import { usePullToRefresh } from '../../utils/use-pull-to-refresh';
import { ContentEmpty } from './content-empty';
import { ContentItemInstance } from './content-item-instance';
import { TaskEdit } from './task/task-edit';

const FilterMode: Record<string, keyof Content | 'all'> = {
  title: 'title',
  folder: 'folder',
  Status: 'status',
  All: 'all',
} as const;

type FilterModes = (typeof FilterMode)[keyof typeof FilterMode];
type FilterModesWithoutAll = Exclude<FilterModes, 'all'>;

const isNotAll = (mode: FilterModes): mode is FilterModesWithoutAll => mode !== FilterMode.All;

let firstMount = true;

export function ContentPanel() {
  const i18n = useI18n('panel', 'content');
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  const [taskEdit, setTaskEdit] = useState<TaskEditState>({ open: false });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ open: false });

  const [expanded, setExpanded] = useState<number | false>(false);

  useEffect(() => {
    if (firstMount) firstMount = false;
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- TODO investigate if this can be avoided
    setExpanded(false);
  }, [tab]);

  const handleError = (type: 'task' | 'download', action: string) => ({
    error: (error: Error & { type?: string }) => {
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
  const disabledRef = useRef<boolean>(!pullToRefreshEnabled || (!logged && !downloadEnabled));

  const onRefresh: OnRefreshCallback = () => {
    if (downloadEnabled) DownloadService.searchAll().subscribe(handleError('download', 'refresh'));
    if (logged) QueryService.listTasks().subscribe(handleError('task', 'refresh'));
  };

  const [visible, setVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');

  const loaderTop = useMemo(() => (visible ? 40 : 0), [visible]);

  const [filterMode, setFilterMode] = useState<FilterModes>(FilterMode.All);
  const filteredContents = useMemo(() => {
    if (!visible || !contents?.length || !filter?.length) return contents;
    if (isNotAll(filterMode)) {
      return contents.filter(content => content[filterMode]?.toString().trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase()));
    }
    const _titleFilter = contents.filter(content => content.title?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase()));
    if (_titleFilter?.length) return _titleFilter;
    const _destinationFilter = contents.filter(content => content.folder?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase()));
    if (_destinationFilter?.length) return _destinationFilter;
    return contents.filter(content => content.status?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase()));
  }, [contents, visible, filter, filterMode]);

  const { containerRef, handlers, ...loaderProps } = usePullToRefresh({ onRefresh, disabled: disabledRef });
  const searchInputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    if (searchInputRef.current) PanelService.init(searchInputRef.current);
    return () => PanelService.destroy();
  }, [searchInputRef]);

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
        ref={searchInputRef}
        sx={{
          position: 'absolute',
          top: '3rem',
          width: '100%',
          zIndex: 100,
          display: 'flex',
          overflow: 'hidden',
          padding: visible ? '0.25rem 0.25rem 0.5rem 0.5rem' : 0,
          maxHeight: visible ? '5rem' : 0,
          transition: 'max-height 0.2s ease-in-out, padding 0.2 ease-in-out',
          backgroundColor: 'rgb(6 6 6)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))',
        }}
        containerRef={containerRef}
        containerGetter={ref => document?.querySelector<HTMLElement>('[id$="app-container"]') ?? ref.current}
        filter={filter}
        onChangeFilter={setFilter}
        onChangeVisible={setVisible}
        focusOnChange
        selectProps={{
          value: filterMode,
          label: i18n('filter_label'),
          onChange: ({ target: { value } }) => setFilterMode(value as FilterModes),
        }}
      >
        {Object.entries(FilterMode).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {i18n(`filter_mode__${value}`)}
          </MenuItem>
        ))}
      </SearchInput>
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
}

export default ContentPanel;
