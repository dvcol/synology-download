import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsDownloadsLocal } from './settings-downloads-local';

describe('settings-downloads-local', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsDownloadsLocal />);
    expect(container).toBeTruthy();
  });
});
