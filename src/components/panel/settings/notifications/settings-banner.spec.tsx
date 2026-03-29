import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsBanner } from './settings-banner';

describe('settings-banner', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsBanner />);
    expect(container).toBeTruthy();
  });
});
