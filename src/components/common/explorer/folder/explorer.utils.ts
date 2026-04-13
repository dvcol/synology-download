import type { File } from '../../../../models/file.model';
import type { Folder } from '../../../../models/folder.model';

export type TreeNode = Folder | File;
export type Tree = Record<string, TreeNode[]>;

export interface VisibleTreeEntry {
  item: TreeNode;
  sourceIndex: number;
}

export type VisibleTree = Record<string, VisibleTreeEntry[]>;

export function buildVisibleTree(tree: Tree, filterVisible: boolean, predicate: (node: TreeNode) => boolean): VisibleTree {
  return Object.entries(tree ?? {}).reduce((acc, [key, nodes]) => {
    const indexed = (nodes ?? []).map((item, sourceIndex) => ({ item, sourceIndex }));
    acc[key] = filterVisible ? indexed.filter(({ item }) => predicate(item)) : indexed;
    return acc;
  }, {} as VisibleTree);
}
