import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsConnection } from './settings-connection';

describe('settings-connection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsConnection />);
    expect(container).toBeTruthy();
  });
});
