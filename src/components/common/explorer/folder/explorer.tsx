import type { FC, SyntheticEvent } from 'react';
import type { Observable } from 'rxjs';

import type { File, FileList } from '../../../../models/file.model';
import type { Folder } from '../../../../models/folder.model';
import type { RootSlice } from '../../../../models/store.model';
import type { Tree } from './explorer.utils';

import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Container } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { catchError, finalize, lastValueFrom, map, of, tap } from 'rxjs';

import { LoggerService } from '../../../../services/logger/logger.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import { QueryService } from '../../../../services/query/query.service';
import { getDestinationsHistory } from '../../../../store/selectors/state.selector';
import { useDebounce } from '../../../../utils/debounce.utils';
import { useI18n } from '../../../../utils/webex.utils';
import { SearchInput } from '../../inputs/search-input';
import { ExplorerBreadCrumbs } from './explorer-breadcrumb';
import { ExplorerLeaf } from './explorer-leaf';
import { ExplorerLeafAdd } from './explorer-leaf-add';
import { ExplorerLoading } from './explorer-loading';
import { ExplorerRecent } from './explorer-recent';
import { buildVisibleTree } from './explorer.utils';

export interface ExplorerProps {
  collapseOnSelect?: boolean;
  flatten?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  fileType?: 'dir' | 'all';
  startPath?: string;
  onChange?: (event: ExplorerEvent) => void;
  editable?: boolean;
  search?: boolean;
}

export interface ExplorerEvent {
  id?: string;
  path?: string;
  folder?: File | Folder;
}

// TODO implement virtual scroll
export const Explorer: FC<ExplorerProps> = ({ collapseOnSelect, flatten, disabled, readonly, fileType, startPath, onChange, editable, search }) => {
  const i18n = useI18n('common', 'explorer');

  const [showDestinations, setShowDestinations] = useState(false);
  const recentDestinations = useSelector<RootSlice, string[]>(getDestinationsHistory);

  const [tree, setTree] = useState<Tree>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({ root: true });
  const [pathLoading, setPathLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('root');
  const [selectedPath, setSelectedPath] = useState<string | undefined>(startPath);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  const [filterVisible, setFilterVisible] = useState<boolean>(!!search);
  const doFilter = useCallback((f: File | Folder) => {
    return disabled || !filter || f?.name?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase());
  }, [disabled, filter]);

  const visibleTree = useMemo(() => buildVisibleTree(tree, filterVisible, doFilter), [tree, filterVisible, doFilter]);

  const isLoginCheck = () => {
    if (QueryService.isLoggedIn) return true;

    const error = new Error('User not logged in.');
    LoggerService.error('User not logged in.', error);
    NotificationService.error({
      title: i18n('login_required', 'common', 'error'),
      message: i18n('please_login', 'common', 'error'),
    });

    return false;
  };

  const fetchFolders = (_tree = tree): Observable<Tree> => {
    if (!isLoginCheck()) return of({ ..._tree, root: [] });

    return QueryService.listFolders(readonly ?? true).pipe(
      map(list => ({ ..._tree, root: list?.shares ?? [] })),
      catchError((error: Error) => {
        LoggerService.error('Failed load folders.', error);
        NotificationService.error({
          title: i18n('list_folders_fail', 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
        return of({ ..._tree, root: [] });
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
    if (!isLoginCheck()) return of({ ..._tree, [key]: [] });

    return QueryService.listFiles(path, fileType ?? 'dir').pipe(
      map((list: FileList) => ({ ..._tree, [key]: list?.files ?? [] })),
      catchError((error: Error) => {
        LoggerService.error(`Failed load files for path '${path}'.`, { path, key, error });
        NotificationService.error({
          title: i18n('list_files_fail', 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
        return of({ ..._tree, [key]: [] });
      }),
    );
  };

  const loadFilesIntoTree = (path: string, key: string): Observable<Tree> => {
    setLoading({ ...loading, [key]: true });
    return fetchFiles(path, key).pipe(
      tap(_tree => setTree(old => ({ ...old, ..._tree }))),
      finalize(() => {
        setTimeout(setLoading, 200, { ...loading, [key]: false });
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
    const folder = tree[ids?.join('-')]?.[index];
    if (!folder) return tree;
    const path = folder.path.split('/')?.slice(1);

    if (!flatten && collapseOnSelect) {
      setExpanded([...expanded.filter(id => nodeId.startsWith(id)), nodeId]);
    }

    if (!tree[nodeId] && flatten) {
      onSelectChange(nodeId, path);
      return lastValueFrom(loadFilesIntoTree(folder.path, nodeId));
    }
    if (!tree[nodeId]) {
      const _tree = await lastValueFrom(loadFilesIntoTree(folder.path, nodeId));
      onSelectChange(nodeId, path, folder);
      return _tree;
    }
    onSelectChange(nodeId, path, folder);
    return tree;
  };

  const crumbSelect = async (index?: number) => {
    if (!index) {
      setFilter('');
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
      return;
    }
    const ids = selected.split('-');
    if (!ids?.length) return;
    if (index > ids.length) return;
    return selectNode(ids.slice(0, index + 1).join('-'));
  };

  const spliceTree = async (nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => {
    setTree((old) => {
      const _new = { ...old };

      // if renamed, remove children nodes and splice new folder
      if (oldFolder?.name) {
        Object.keys(old)?.forEach((key) => {
          if (key.startsWith(nodeId)) delete _new[key];
        });

        if (newFolder) {
          const nodePath = nodeId.split('-');
          const index = Number(nodePath?.pop());

          if (Number.isInteger(index) && index >= 0) {
            _new[nodePath.join('-')][index] = newFolder;
          }
        }
      } else {
        // else juste add new folder to active node
        _new[nodeId].push(newFolder as File & Folder);
      }
      return _new;
    });
    // if old folder exit
    if (oldFolder?.name) return;
    // else select new folder
    return selectNode(`${nodeId}-${(tree[nodeId]?.length ?? 1) - 1}`);
  };

  const onSelect = async ($event: SyntheticEvent | null, itemId: string | null) => itemId && selectNode(itemId);
  const onExpand = ($event: SyntheticEvent | null, itemIds: string[]) => !flatten && setExpanded(itemIds);

  const loadNestedPath = async (path: string) => {
    const _crumbs = path?.includes('/') ? path?.split('/') : [path];

    let _tree = tree;
    if (!_tree?.root?.length) {
      _tree = await lastValueFrom(fetchFolders(_tree));
    }

    if (!_crumbs?.length) return;

    setPathLoading(true);

    try {
      let _selected = selected;
      let _folder = tree?.[selected]?.find(_f => _f?.name === _crumbs[0]);
      for (let i = 0; i < _crumbs.length; i += 1) {
        const currentLeaves = _tree?.[_selected];
        if (!currentLeaves?.length) break;

        const _leaf = currentLeaves.findIndex(_f => _f?.name === _crumbs[i]);
        if (_leaf < 0) break;

        _folder = currentLeaves[_leaf];
        _selected = `${_selected}-${_leaf}`;

        _tree = await lastValueFrom(fetchFiles(_folder?.path, _selected, _tree));
      }

      setTree(old => ({ ...old, ..._tree }));
      onSelectChange(_selected, _crumbs, _folder);

      setLoading(_loading => ({ ..._loading, root: false }));
    } finally {
      setPathLoading(false);
    }
  };

  const debounceLoadTree = useDebounce(async () => {
    if (startPath?.length) await loadNestedPath(startPath);
    else if (!tree.root?.length) await lastValueFrom(loadFoldersIntoTree());
  }, 500);

  useEffect(() => {
    debounceLoadTree().catch((error: Error) => LoggerService.error('Failed to load explorer tree.', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on startPath change
  }, [startPath]);

  return (
    <Container ref={containerRef} disableGutters maxWidth={false} sx={{ height: '100%', outline: 'none' }} tabIndex={0}>
      <ExplorerBreadCrumbs
        crumbs={crumbs}
        showDestinations={showDestinations}
        hasDestinations={!!recentDestinations?.length}
        onClick={async (_, i) => crumbSelect(i)}
        onRecent={() => setShowDestinations(_show => !_show)}
        disabled={disabled || pathLoading}
      />
      {showDestinations
        ? (
            <ExplorerRecent
              selected={selectedPath}
              destinations={recentDestinations}
              onSelect={async (_path) => {
                setShowDestinations(_show => !_show);
                return loadNestedPath(_path);
              }}
            />
          )
        : (
            <SimpleTreeView
              key={`tree-${disabled}`}
              aria-label="file system navigator"
              slots={{ collapseIcon: FolderOpenIcon, expandIcon: FolderIcon }}
              selectedItems={selected}
              onSelectedItemsChange={onSelect}
              expandedItems={expanded}
              onExpandedItemsChange={onExpand}
              disableSelection={disabled || pathLoading}
              sx={{
                overflow: 'auto',
                transition: 'height 0.2s ease-in-out',
                height: `calc(100% - ${filterVisible ? 4.4 : 2.0625}em)`,
              }}
            >
              {
                // only > 1 so that we do not allow creation of shares
                flatten && editable && !pathLoading && !loading[selected] && selected?.split('-')?.length > 1 && !!selectedPath && (
                  <ExplorerLeafAdd nodeId={selected} path={selectedPath} disabled={disabled} spliceTree={spliceTree} />
                )
              }
              {flatten && <ExplorerLoading loading={pathLoading || loading[selected]} empty={!visibleTree[selected]?.length} disabled={disabled} flatten={flatten} />}
              {flatten
                && !pathLoading
                && !loading[selected]
                && visibleTree[selected]?.map(({ item, sourceIndex }) => (
                  <ExplorerLeaf
                    key={`${selected}-${sourceIndex}-${disabled}`}
                    nodeId={`${selected}-${sourceIndex}`}
                    folder={item}
                    tree={tree}
                    visibleTree={visibleTree}
                    loading={loading}
                    disabled={disabled}
                    editable={editable}
                    flatten={flatten}
                    spliceTree={spliceTree}
                  />
                ))}
              {!flatten
                && !pathLoading
                && visibleTree?.root?.map(({ item, sourceIndex }) => (
                  <ExplorerLeaf
                    key={`root-${sourceIndex}-${disabled}`}
                    nodeId={`root-${sourceIndex}`}
                    folder={item}
                    tree={tree}
                    visibleTree={visibleTree}
                    loading={loading}
                    disabled={disabled}
                    editable={editable}
                    flatten={flatten}
                    spliceTree={spliceTree}
                  />
                ))}
            </SimpleTreeView>
          )}
      <SearchInput
        containerRef={containerRef}
        filter={filter}
        showFilter={search}
        disabled={disabled}
        onChangeFilter={setFilter}
        onChangeVisible={setFilterVisible}
        sx={{
          transition: 'max-height 0.2s ease-in-out',
          maxHeight: filterVisible ? '5rem' : 0,
        }}
      />
    </Container>
  );
};
