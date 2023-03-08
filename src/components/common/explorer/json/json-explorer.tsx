import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import { Container } from '@mui/material';

import * as React from 'react';

import type { FC } from 'react';

const objectToLeaf = (obj: Record<string, any> | any, name: string, parent?: string): JsonLeaf => {
  const id = parent ? `${parent}-${name}` : name;
  if (typeof obj === 'object') {
    return { id, value: name, children: Object.keys(obj).map((key, i) => objectToLeaf(obj[key], key, `${id}-${i}`)) };
  }
  return { id, value: String(obj) };
};

interface JsonLeaf {
  id: string;
  value: string;
  children?: readonly JsonLeaf[];
}
export type JsonExplorerProps = { data: Record<string, any>; name?: string };
export const JsonExplorer: FC<JsonExplorerProps> = ({ data, name }) => {
  const tree = objectToLeaf(data, name ?? 'root');

  const renderTree = (nodes: JsonLeaf) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.id.split('-').pop()} sx={{ wordBreak: 'break-all' }}>
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : nodes.value}
    </TreeItem>
  );

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
      <TreeView
        aria-label="rich object"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        disableSelection
      >
        {renderTree(tree)}
      </TreeView>
    </Container>
  );
};
