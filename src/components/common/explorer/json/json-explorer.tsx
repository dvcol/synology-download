import type { FC } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { Container } from '@mui/material';
import * as React from 'react';

function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function objectToLeaf(obj: Record<string, any> | any, name: string, parent?: string): JsonLeaf {
  const id = parent ? `${parent}-${name}` : name;
  if (isObject(obj)) {
    return { id, value: name, children: Object.keys(obj).map((key, i) => objectToLeaf(obj[key], key, `${id}-${i}`)) };
  }
  return { id, value: String(obj) };
}

interface JsonLeaf {
  id: string;
  value: string;
  children?: readonly JsonLeaf[];
}
export interface JsonExplorerProps { data: Record<string, any>; name?: string }
export const JsonExplorer: FC<JsonExplorerProps> = ({ data, name }) => {
  const tree = objectToLeaf(data, name ?? 'root');

  const renderTree = (nodes: JsonLeaf) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.id.split('-').pop()} sx={{ wordBreak: 'break-all' }}>
      {Array.isArray(nodes.children) ? nodes.children.map((node: JsonLeaf) => renderTree(node)) : nodes.value}
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
