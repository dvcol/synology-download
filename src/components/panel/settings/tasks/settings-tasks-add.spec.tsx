import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsTasksAdd } from './settings-tasks-add';

describe('settings-tasks-add', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SettingsTasksAdd />);
    expect(container).toBeTruthy();
  });
});
