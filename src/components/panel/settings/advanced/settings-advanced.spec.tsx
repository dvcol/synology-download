import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsAdvanced } from './settings-advanced';

describe('settings-advanced', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsAdvanced />);
    expect(container).toBeTruthy();
  });
});
