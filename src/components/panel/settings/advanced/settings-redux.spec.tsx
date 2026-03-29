import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsRedux } from './settings-redux';

describe('settings-redux', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsRedux />);
    expect(container).toBeTruthy();
  });
});
