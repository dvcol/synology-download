import { renderWithProviders } from '../../../test/render-helper';
import { SettingsRoutes } from './settings-routes';

describe('settings-routes', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsRoutes />);
    expect(container).toBeTruthy();
  });
});
