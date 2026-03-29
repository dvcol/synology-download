import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsTabs } from './settings-tabs';

describe('settings-tabs', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsTabs />);
    expect(container).toBeTruthy();
  });
});
