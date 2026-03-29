/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../../test/render-helper';
import { TaskEdit } from './task-edit';

const mockTask = {
  id: 'test-1',
  title: 'Test Task',
  status: 2,
  size: 1024,
  type: 'bt',
  username: 'admin',
  additional: { detail: {}, transfer: {}, file: [] },
} as any;

describe('task-edit', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TaskEdit open={false} task={mockTask} />);
    expect(container).toBeTruthy();
  });
});
