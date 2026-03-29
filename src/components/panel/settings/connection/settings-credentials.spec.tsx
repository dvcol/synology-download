import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsCredentials } from './settings-credentials';

describe('settings-credentials', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsCredentials />);
    expect(container).toBeTruthy();
  });
});
