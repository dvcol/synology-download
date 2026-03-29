/* eslint-disable ts/no-unsafe-assignment */
import { SimpleTreeView } from '@mui/x-tree-view';

import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerLeaf } from './explorer-leaf';

describe('explorer-leaf', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SimpleTreeView>
        <ExplorerLeaf
          nodeId="1"
          folder={{ name: 'test', path: '/test', isdir: true } as any}
          tree={{}}
          loading={{}}
        />
      </SimpleTreeView>,
    );
    expect(container).toBeTruthy();
  });
});
