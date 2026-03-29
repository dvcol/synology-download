import { renderWithProviders } from '../../../test/render-helper';
import { SettingsNavbar } from './settings-navbar';

describe('settings-navbar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsNavbar tabs={[]} />);
    expect(container).toBeTruthy();
  });
});
