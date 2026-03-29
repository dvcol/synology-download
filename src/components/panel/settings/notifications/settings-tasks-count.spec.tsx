import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsTasksCount } from './settings-tasks-count';

describe('settings-tasks-count', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsTasksCount />);
    expect(container).toBeTruthy();
  });
});
