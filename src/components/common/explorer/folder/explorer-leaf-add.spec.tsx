import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerLeafAdd } from './explorer-leaf-add';

describe('explorer-leaf-add', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExplorerLeafAdd nodeId="1" path="/test" />);
    expect(container).toBeTruthy();
  });
});
