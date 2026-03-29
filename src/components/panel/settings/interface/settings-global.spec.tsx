import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsGlobal } from './settings-global';

describe('settings-global', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsGlobal />);
    expect(container).toBeTruthy();
  });
});
