import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsExport } from './settings-export';

describe('settings-export', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsExport />);
    expect(container).toBeTruthy();
  });
});
