import ClearIcon from '@mui/icons-material/Clear';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { TreeView } from '@mui/lab';
import { Button, Container, Stack, TextField, Tooltip } from '@mui/material';

import React, { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { catchError, finalize, lastValueFrom, map, tap } from 'rxjs';

import type { File, FileList, Folder, RootSlice } from '@src/models';

import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getDestinationsHistory } from '@src/store/selectors';
import { useI18n } from '@src/utils';

import { useDebounce } from '@src/utils/debounce.utils';

import { ExplorerBreadCrumbs } from './explorer-breadcrumb';
import { ExplorerLeaf } from './explorer-leaf';
import { ExplorerLeafAdd } from './explorer-leaf-add';
import { ExplorerLoading } from './explorer-loading';
import { ExplorerRecent } from './explorer-recent';

import type { FC } from 'react';
import type { Observable } from 'rxjs';

export type ExplorerProps = {
  collapseOnSelect?: boolean;
  flatten?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  fileType?: 'dir' | 'all';
  startPath?: string;
  onChange?: (event: ExplorerEvent) => void;
  editable?: boolean;
  search?: boolean;
};

export type ExplorerEvent = {
  id?: string;
  path?: string;
  folder?: File | Folder;
};

type Tree = Record<string, (Folder | File)[]>;

// TODO implement virtual scroll
export const Explorer: FC<ExplorerProps> = ({ collapseOnSelect, flatten, disabled, readonly, fileType, startPath, onChange, editable, search }) => {
  const i18n = useI18n('common', 'explorer');

  const [showDestinations, setShowDestinations] = useState(false);
  const recentDestinations = useSelector<RootSlice, string[]>(getDestinationsHistory);

  const [tree, setTree] = useState<Tree>({});
  const [filteredTree, setFilteredTree] = useState<Tree>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({ root: true });
  const [pathLoading, setPathLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('root');
  const [selectedPath, setSelectedPath] = useState<string | undefined>(startPath);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('');

  const [filterRef, setFilterRef] = useState<HTMLDivElement | null>(null);
  const [filterFocus, setFilterFocus] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const showFilter = filterFocus || search || (!disabled && !!filter);
  const doFilter = (f: File | Folder) => disabled || !filter || f?.name?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase());

  const isLoginCheck = () => {
    if (QueryService.isLoggedIn) return QueryService.isLoggedIn;

    const error = new Error('User not logged in.');
    LoggerService.error(`User not logged in.`, error);
    NotificationService.error({
      title: i18n('login_required', 'common', 'error'),
      message: i18n('please_login', 'common', 'error'),
    });
    throw error;
  };

  const fetchFolders = (_tree = tree): Observable<Tree> => {
    isLoginCheck();
    return QueryService.listFolders(readonly ?? true).pipe(
      map(list => ({ ..._tree, root: list?.shares ?? [] })),
      catchError(error => {
        LoggerService.error(`Failed load folders.`, error);
        NotificationService.error({
          title: i18n(`list_folders_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
        throw error;
      }),
    );
  };

  const loadFoldersIntoTree = () => {
    setLoading(_loading => ({ ..._loading, root: true }));
    return fetchFolders().pipe(
      tap(_tree => setTree(old => ({ ...old, ..._tree }))),
      finalize(() => {
        setTimeout(() => setLoading(_loading => ({ ..._loading, root: false })), 200);
      }),
    );
  };

  const fetchFiles = (path: string, key: string, _tree = tree): Observable<Tree> => {
    isLoginCheck();
    return QueryService.listFiles(path, fileType ?? 'dir').pipe(
      map((list: FileList) => ({ ..._tree, [key]: list?.files ?? [] })),
      catchError(error => {
        LoggerService.error(`Failed load files for path '${path}'.`, { path, key, error });
        NotificationService.error({
          title: i18n(`list_files_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
        throw error;
      }),
    );
  };

  const loadFilesIntoTree = (path: string, key: string): Observable<Tree> => {
    setLoading({ ...loading, [key]: true });
    return fetchFiles(path, key).pipe(
      tap(_tree => setTree(old => ({ ...old, ..._tree }))),
      finalize(() => {
        setTimeout(() => setLoading({ ...loading, [key]: false }), 200);
      }),
    );
  };

  const onSelectChange = (id: string, path: string[], folder?: File | Folder) => {
    setSelected(id);
    setCrumbs(path);
    setSelectedPath(path.join('/'));
    onChange?.({ id, path: path.join('/'), folder });
  };

  const selectNode = async (nodeId: string): Promise<Tree> => {
    if (selected === nodeId) return tree;
    setFilter('');

    const ids = nodeId.split('-');
    const index = Number(ids.pop());
    const folder = filteredTree[ids?.join('-')][index];
    const path = folder.path.split('/')?.slice(1);

    if (!flatten && collapseOnSelect) {
      setExpanded([...expanded.filter(id => nodeId.startsWith(id)), nodeId]);
    }

    if (!filteredTree[nodeId] && flatten) {
      onSelectChange(nodeId, path);
      return lastValueFrom(loadFilesIntoTree(folder.path, nodeId));
    }
    if (!filteredTree[nodeId]) {
      const _tree = await lastValueFrom(loadFilesIntoTree(folder.path, nodeId));
      onSelectChange(nodeId, path, folder);
      return _tree;
    }
    onSelectChange(nodeId, path, folder);
    return tree;
  };

  const crumbSelect = (index?: number) => {
    if (!index) {
      setFilter('');
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
      return;
    }
    const ids = selected.split('-');
    if (index < (ids?.length ?? 0) - 1) {
      ids.pop();
      return selectNode(ids.join('-'));
    }
  };

  const spliceTree = (nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => {
    setTree(old => {
      const _new = { ...old };

      // if renamed, remove children nodes and splice new folder
      if (oldFolder?.name) {
        Object.keys(old)?.forEach(key => {
          if (key.startsWith(nodeId)) delete _new[key];
        });

        if (newFolder) {
          const nodePath = nodeId.split('-');
          const index = Number(nodePath?.pop());

          if (index && Number.isInteger(index)) {
            _new[nodePath.join('-')][index] = newFolder;
          }
        }
      }
      // else juste add new folder to active node
      else {
        _new[nodeId].push(newFolder as File & Folder);
      }
      return _new;
    });
  };

  const onSelect = ($event: React.SyntheticEvent, nodeId: string) => selectNode(nodeId);
  const onExpand = ($event: React.SyntheticEvent, nodeIds: string[]) => !flatten && setExpanded(nodeIds);

  const loadNestedPath = async (path: string) => {
    const _crumbs = path?.includes('/') ? path?.split('/') : [path];

    let _tree = tree;
    if (!_tree?.root?.length) {
      _tree = await lastValueFrom(fetchFolders(_tree));
    }

    if (!_crumbs?.length) return;

    setPathLoading(true);

    let _selected = selected;
    let _folder = tree?.[selected]?.find(_f => _f?.name === _crumbs[0]);
    for (let i = 0; i < _crumbs.length; i += 1) {
      const _leaf = _tree?.[_selected]?.findIndex(_f => _f?.name === _crumbs[i]);

      if (_leaf < 0) break;

      _folder = _tree?.[_selected]?.[_leaf];
      _selected = `${_selected}-${_leaf}`;
      // eslint-disable-next-line no-await-in-loop -- pathing requires sequential loading
      _tree = await lastValueFrom(fetchFiles(_folder?.path, _selected, _tree));
    }

    setTree(old => ({ ...old, ..._tree }));
    onSelectChange(_selected, _crumbs, _folder);

    setLoading(_loading => ({ ...loading, root: false }));
    setPathLoading(false);
  };

  const debounceLoadTree = useDebounce(async () => {
    if (startPath?.length) await loadNestedPath(startPath);
    else if (!tree.root?.length) await lastValueFrom(loadFoldersIntoTree());
  }, 500);

  useEffect(() => {
    debounceLoadTree().catch(LoggerService.error);
  }, [startPath]);

  useEffect(() => {
    if (showFilter && tree) {
      const filtered = Object.entries(tree).reduce((curr, [key, value]) => {
        curr[key] = value?.filter(doFilter);
        return curr;
      }, {} as Tree);
      setFilteredTree(filtered);
    } else {
      setFilteredTree(tree);
    }
  }, [tree, search, disabled, filter]);

  const listener = async (e: KeyboardEvent) => {
    // if an input is focused, do not filter
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    // if any modifier keys are pressed without any other key, do not filter
    if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') return;
    // if ctrl+v or cmd+v is pressed and clipboard is not empty, paste clipboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && navigator.clipboard) {
      const clip = await navigator.clipboard.readText();
      if (clip) setFilter(_prev => `${_prev}${clip}`);
    }
    // if ctrl+f or cmd+f is pressed, focus the filter
    else if (!filter?.length && (e.ctrlKey || e.metaKey) && e.key === 'f') {
      const input = filterRef?.querySelector('input');
      if (input) input.focus();
    }
    // if backspace is pressed, remove last character
    else if (e.key === 'Backspace') setFilter(_prev => _prev.slice(0, -1));
    else setFilter(_prev => `${_prev}${e.key}`);
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (disabled) {
      containerRef?.current?.removeEventListener('keydown', listener);
      setFilter('');
    } else containerRef?.current?.addEventListener('keydown', listener);
    return () => containerRef?.current?.removeEventListener('keydown', listener);
  }, [containerRef, disabled]);

  return (
    <Container ref={containerRef} disableGutters maxWidth={false} sx={{ height: '100%', outline: 'none' }} tabIndex={0}>
      <ExplorerBreadCrumbs
        crumbs={crumbs}
        showDestinations={showDestinations}
        hasDestinations={!!recentDestinations?.length}
        onClick={(_, i) => crumbSelect(i)}
        onRecent={() => setShowDestinations(_show => !_show)}
        disabled={disabled || pathLoading}
      />
      {showDestinations ? (
        <ExplorerRecent
          selected={selectedPath}
          destinations={recentDestinations}
          onSelect={_path => {
            setShowDestinations(_show => !_show);
            return loadNestedPath(_path);
          }}
        />
      ) : (
        <TreeView
          key={`tree-${disabled}`}
          aria-label="file system navigator"
          defaultCollapseIcon={<FolderOpenIcon />}
          defaultExpandIcon={<FolderIcon />}
          selected={selected}
          onNodeSelect={onSelect}
          expanded={expanded}
          onNodeToggle={onExpand}
          disableSelection={disabled || pathLoading}
          sx={{
            overflow: 'auto',
            height: `calc(100% - ${showFilter ? 4.5 : 2.0625}em)`,
          }}
        >
          {
            // only > 1 so that we do not allow creation of shares
            flatten && editable && !pathLoading && !loading[selected] && selected?.split('-')?.length > 1 && selectedPath && (
              <ExplorerLeafAdd nodeId={selected} path={selectedPath} disabled={disabled} spliceTree={spliceTree} />
            )
          }
          {flatten && <ExplorerLoading loading={pathLoading || loading[selected]} empty={!filteredTree[selected]?.length} />}
          {flatten &&
            !pathLoading &&
            !loading[selected] &&
            filteredTree[selected].map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`${selected}-${i}`}
                folder={f}
                tree={filteredTree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
          {!flatten &&
            !pathLoading &&
            filteredTree?.root?.map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`root-${i}`}
                folder={f}
                tree={filteredTree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
        </TreeView>
      )}
      <Stack hidden={!showFilter} direction="row" sx={{ flex: '1 1 auto', alignItems: 'center', p: '0 0.25em' }}>
        <TextField
          ref={setFilterRef}
          placeholder={'Search'}
          variant="standard"
          fullWidth={true}
          value={filter}
          disabled={disabled}
          onChange={e => setFilter(e.target.value)}
          onFocus={() => setFilterFocus(true)}
          onBlur={() => setFilterFocus(false)}
        />
        <Tooltip arrow title={i18n('cancel', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
          <span>
            <Button
              key="cancel"
              color="error"
              sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em' }}
              disabled={disabled || !filter}
              onClick={() => setFilter('')}
            >
              <ClearIcon fontSize="small" sx={{ width: '1em', fontSize: '1.125em' }} />
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Container>
  );
};
