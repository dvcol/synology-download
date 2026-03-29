import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsTasks } from './settings-tasks';

describe('settings-tasks', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsTasks />);
    expect(container).toBeTruthy();
  });
});
