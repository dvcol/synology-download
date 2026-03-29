import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsQuickMenus } from './settings-quick-menus';

describe('settings-quick-menus', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsQuickMenus />);
    expect(container).toBeTruthy();
  });
});
