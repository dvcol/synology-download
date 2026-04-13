import type { File } from '../../../../models/file.model';
import type { Tree } from './explorer.utils';

import { buildVisibleTree } from './explorer.utils';

function makeNode(name: string): File {
  return {
    isdir: true,
    name,
    path: `/${name}`,
  };
}

describe('explorer.utils', () => {
  it('keeps original source indices for sparse root filtering', () => {
    const tree: Tree = {
      root: [makeNode('alpha'), makeNode('beta'), makeNode('gamma'), makeNode('delta')],
    };

    const visibleTree = buildVisibleTree(tree, true, node => ['alpha', 'delta'].includes(node.name));

    expect(visibleTree.root.map(({ sourceIndex }) => sourceIndex)).toEqual([0, 3]);
  });

  it('keeps original source indices for nested filtering', () => {
    const tree: Tree = {
      'root': [makeNode('parent')],
      'root-0': [makeNode('child-0'), makeNode('child-1'), makeNode('child-2')],
    };

    const visibleTree = buildVisibleTree(tree, true, node => node.name !== 'child-1');

    expect(visibleTree['root-0'].map(({ sourceIndex }) => sourceIndex)).toEqual([0, 2]);
    expect(visibleTree['root-0'].map(({ sourceIndex }) => `root-0-${sourceIndex}`)).toEqual(['root-0-0', 'root-0-2']);
  });

  it('returns all nodes when filter is not visible', () => {
    const tree: Tree = {
      root: [makeNode('alpha'), makeNode('beta')],
    };

    const visibleTree = buildVisibleTree(tree, false, () => false);

    expect(visibleTree.root.map(({ sourceIndex }) => sourceIndex)).toEqual([0, 1]);
  });
});
