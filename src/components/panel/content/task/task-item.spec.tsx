/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../../test/render-helper';
import { TaskItem } from './task-item';

const mockTask = {
  id: 'test-1',
  title: 'Test Task',
  status: 2,
  size: 1024,
  type: 'bt',
  username: 'admin',
  additional: { detail: {}, transfer: {}, file: [] },
} as any;

describe('task-item', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <TaskItem
        task={mockTask}
        setTaskEdit={() => {}}
        setConfirmation={() => {}}
        accordion={{ expanded: false, hover: false } as any}
      />,
    );
    expect(container).toBeTruthy();
  });
});
