import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsDownloads } from './settings-downloads';

describe('settings-downloads', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsDownloads />);
    expect(container).toBeTruthy();
  });
});
