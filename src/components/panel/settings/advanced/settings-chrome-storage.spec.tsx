import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsChromeStorage } from './settings-chrome-storage';

describe('settings-chrome-storage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsChromeStorage />);
    expect(container).toBeTruthy();
  });
});
