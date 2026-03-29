import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerBreadCrumbs } from './explorer-breadcrumb';

describe('explorer-breadcrumb', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExplorerBreadCrumbs crumbs={['root', 'folder']} />);
    expect(container).toBeTruthy();
  });
});
