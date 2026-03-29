import { renderWithProviders } from '../../../test/render-helper';
import { SettingsInjector } from './settings-injector';

describe('settings-injector', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsInjector />);
    expect(container).toBeTruthy();
  });
});
