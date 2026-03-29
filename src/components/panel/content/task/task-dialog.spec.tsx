import { renderWithProviders } from '../../../../test/render-helper';
import { TaskDialog } from './task-dialog';

describe('task-dialog', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TaskDialog open={false} />);
    expect(container).toBeTruthy();
  });
});
