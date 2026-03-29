import { renderWithProviders } from '../../../../test/render-helper';
import { TaskAdd } from './task-add';

describe('task-add', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TaskAdd />);
    expect(container).toBeTruthy();
  });
});
