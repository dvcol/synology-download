import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsInterface } from './settings-interface';

describe('settings-interface', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsInterface />);
    expect(container).toBeTruthy();
  });
});
