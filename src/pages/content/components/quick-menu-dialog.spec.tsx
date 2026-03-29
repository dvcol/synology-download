import { renderWithProviders } from '../../../test/render-helper';
import { QuickMenuDialog } from './quick-menu-dialog';

describe('quick-menu-dialog', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<QuickMenuDialog />);
    expect(container).toBeTruthy();
  });
});
