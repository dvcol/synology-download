import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsDownloadsHistory } from './settings-downloads-history';

describe('settings-downloads-history', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsDownloadsHistory />);
    expect(container).toBeTruthy();
  });
});
