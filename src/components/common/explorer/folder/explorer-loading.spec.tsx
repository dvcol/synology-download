import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerLoading } from './explorer-loading';

describe('explorer-loading', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExplorerLoading />);
    expect(container).toBeTruthy();
  });
});
