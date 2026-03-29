import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsDownloadsIntercept } from './settings-downloads-intercept';

describe('settings-downloads-intercept', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsDownloadsIntercept />);
    expect(container).toBeTruthy();
  });
});
