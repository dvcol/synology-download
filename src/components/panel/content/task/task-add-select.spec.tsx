import { renderWithProviders } from '../../../../test/render-helper';
import { TaskAddSelect } from './task-add-select';

describe('task-add-select', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <TaskAddSelect open={false} list_id="test" source="http://example.com" />,
    );
    expect(container).toBeTruthy();
  });
});
