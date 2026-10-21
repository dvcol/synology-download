import type { Task } from '../../../../models/task.model';

import { ContentSource } from '../../../../models/content.model';
import { TaskStatus, TaskType } from '../../../../models/task.model';
import { renderWithProviders } from '../../../../test/render-helper';
import { TaskCard } from './task-card';

const task: Task = {
  source: ContentSource.Task,
  key: 'task-test',
  id: 'task-test',
  title: 'Test task',
  type: TaskType.bt,
  username: 'admin',
  status: TaskStatus.downloading,
  received: 512000,
  size: 1000000,
  speed: 1000,
  eta: '8m 08s',
};

describe('task-card progress text', () => {
  it.each([
    { received: 512000, size: 1000000, expected: '512 kB of 1 MB downloaded' },
    { received: 0, size: 0, expected: '0 B of 0 B downloaded' },
    { received: 0, size: 1000000, expected: '0 B of 1 MB downloaded' },
  ])('renders spaced byte counts: $expected', ({ received, size, expected }) => {
    expect.assertions(4);
    const { container, getByText } = renderWithProviders(<TaskCard task={{ ...task, received, size }} />);
    expect(getByText(expected)).toBeTruthy();
    expect(container.textContent).toContain('common__model__task_status__downloading');
    expect(container.textContent).toContain('8m 08s');
    expect(container.textContent).toContain('1 kB/s');
  });

  it('keeps byte counts when status is hidden and speed is unavailable', () => {
    expect.assertions(3);
    const { container, getByText } = renderWithProviders(<TaskCard task={{ ...task, status: TaskStatus.finished, speed: 0 }} hideStatus />);
    expect(getByText('512 kB of 1 MB downloaded')).toBeTruthy();
    expect(container.textContent).not.toContain('common__model__task_status__finished');
    expect(container.textContent).not.toContain('/s');
  });
});
