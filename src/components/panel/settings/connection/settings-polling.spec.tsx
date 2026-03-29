import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsPolling } from './settings-polling';

describe('settings-polling', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsPolling />);
    expect(container).toBeTruthy();
  });
});
