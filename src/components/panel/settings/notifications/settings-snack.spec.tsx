import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsSnack } from './settings-snack';

describe('settings-snack', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsSnack />);
    expect(container).toBeTruthy();
  });
});
