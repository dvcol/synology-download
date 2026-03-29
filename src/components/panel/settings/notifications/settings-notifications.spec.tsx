import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsNotifications } from './settings-notifications';

describe('settings-notifications', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsNotifications />);
    expect(container).toBeTruthy();
  });
});
