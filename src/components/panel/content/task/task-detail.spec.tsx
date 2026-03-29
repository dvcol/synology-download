/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../../test/render-helper';
import { TaskDetail } from './task-detail';

const mockTask = {
  id: 'test-1',
  title: 'Test Task',
  status: 2,
  size: 1024,
  type: 'bt',
  username: 'admin',
  additional: { detail: {}, transfer: {}, file: [] },
} as any;

describe('task-detail', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <TaskDetail
        task={mockTask}
        isDisabled={false}
        loadingIcon={{}}
        buttonClick={() => {}}
        setTaskEdit={() => {}}
        setConfirmation={() => {}}
      />,
    );
    expect(container).toBeTruthy();
  });
});
