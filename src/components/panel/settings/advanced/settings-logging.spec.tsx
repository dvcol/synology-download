import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsLogging } from './settings-logging';

describe('settings-logging', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsLogging />);
    expect(container).toBeTruthy();
  });
});
