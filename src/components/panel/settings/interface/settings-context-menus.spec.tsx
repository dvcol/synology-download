import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsContextMenus } from './settings-context-menus';

describe('settings-context-menus', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsContextMenus />);
    expect(container).toBeTruthy();
  });
});
