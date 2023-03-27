import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { TreeView } from '@mui/lab';
import { Container } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { catchError, finalize, tap } from 'rxjs';

import type { File, FileList, Folder, RootSlice } from '@src/models';

import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getDestinationsHistory } from '@src/store/selectors';
import { useI18n } from '@src/utils';

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
};

export type ExplorerEvent = {
  id?: string;
  path?: string;
  folder?: File | Folder;
};

// TODO implement virtual scroll
export const Explorer: FC<ExplorerProps> = ({ collapseOnSelect, flatten, disabled, readonly, fileType, startPath, onChange, editable }) => {
  const i18n = useI18n('common', 'explorer');

  const [showDestinations, setShowDestinations] = useState(false);
  const recentDestinations = useSelector<RootSlice, string[]>(getDestinationsHistory);

  const [tree, setTree] = useState<Record<string, File[] | Folder[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({
    root: true,
  });
  const [selected, setSelected] = useState<string>('root');
  const [selectedPath, setSelectedPath] = useState<string | undefined>(startPath);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [crumbs, setCrumbs] = useState<string[]>([]);

  useEffect(() => {
    if (QueryService.isLoggedIn) {
      QueryService.listFolders(readonly ?? true).subscribe({
        next: list => {
          setTree({ root: list?.shares ?? [] });
          setLoading(_loading => ({ ..._loading, root: false }));
        },
        error: error => {
          LoggerService.error(`Failed load folders.`, error);
          NotificationService.error({
            title: i18n(`list_folders_fail`, 'common', 'error'),
            message: error?.message ?? error?.name ?? '',
          });
        },
      });
    }
  }, []);

  const selectPath = (path: string) => {
    setCrumbs(path?.includes('/') ? path?.split('/') : [path]);
    setSelectedPath(path);
  };

  useEffect(() => {
    if (startPath?.length) selectPath(startPath);
  }, [startPath]);

  const listFiles = (path: string, key: string): Observable<FileList> => {
    setLoading({ ...loading, [key]: true });
    return QueryService.listFiles(path, fileType ?? 'dir').pipe(
      tap((list: FileList) => setTree({ ...tree, [key]: list?.files ?? [] })),
      finalize(() => {
        setTimeout(() => setLoading({ ...loading, [key]: false }), 200);
      }),
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

  const onSelectChange = (id: string, path: string[], folder?: File | Folder) => {
    setSelected(id);
    setCrumbs(path);
    setSelectedPath(path.join('/'));
    onChange?.({ id, path: path.join('/'), folder });
  };

  const selectNode = (nodeId: string) => {
    if (selected !== nodeId) {
      const ids = nodeId.split('-');
      const index = Number(ids.pop());
      const folder = tree[ids?.join('-')][index];
      const path = folder.path.split('/')?.slice(1);

      if (!flatten && collapseOnSelect) {
        setExpanded([...expanded.filter(id => nodeId.startsWith(id)), nodeId]);
      }

      if (!tree[nodeId] && flatten) {
        onSelectChange(nodeId, path);
        listFiles(folder.path, nodeId).subscribe();
      } else if (!tree[nodeId]) {
        listFiles(folder.path, nodeId).subscribe(() => onSelectChange(nodeId, path, folder));
      } else {
        onSelectChange(nodeId, path, folder);
      }
    }
  };

  const crumbSelect = (index?: number) => {
    if (index) {
      const ids = selected.split('-');
      if (index < (ids?.length ?? 0) - 1) {
        ids.pop();
        selectNode(ids.join('-'));
      }
    } else {
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
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
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
      <ExplorerBreadCrumbs
        crumbs={crumbs}
        showDestinations={showDestinations}
        hasDestinations={!!recentDestinations?.length}
        onClick={(_, i) => crumbSelect(i)}
        onRecent={() => setShowDestinations(_show => !_show)}
        disabled={disabled}
      />
      {showDestinations ? (
        <ExplorerRecent
          selected={selectedPath}
          destinations={recentDestinations}
          onSelect={destination => {
            selectPath(destination);
            onChange?.({ path: destination });
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
          disableSelection={disabled}
          sx={{
            overflow: 'auto',
            height: 'calc(100% - 2.0625em)',
          }}
        >
          {
            // only > 1 so that we do not allow creation of shares
            flatten && editable && !loading[selected] && selected?.split('-')?.length > 1 && selectedPath && (
              <ExplorerLeafAdd nodeId={selected} path={selectedPath} disabled={disabled} spliceTree={spliceTree} />
            )
          }
          {flatten && <ExplorerLoading loading={loading[selected]} empty={!tree[selected]?.length} />}
          {flatten &&
            !loading[selected] &&
            tree[selected]?.map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`${selected}-${i}`}
                folder={f}
                tree={tree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
          {!flatten &&
            tree?.root?.map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`root-${i}`}
                folder={f}
                tree={tree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
        </TreeView>
      )}
    </Container>
  );
};
