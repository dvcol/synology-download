import { renderWithProviders } from '../../../../test/render-helper';
import { TaskEditFiles } from './task-edit-files';

describe('task-edit-files', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TaskEditFiles taskId="test-1" />);
    expect(container).toBeTruthy();
  });
});
