import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerLeafEdit } from './explorer-leaf-edit';

describe('explorer-leaf-edit', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExplorerLeafEdit folder={{ name: 'test', path: '/test' }} />);
    expect(container).toBeTruthy();
  });
});
