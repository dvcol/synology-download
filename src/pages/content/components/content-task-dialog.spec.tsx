import { renderWithProviders } from '../../../test/render-helper';
import { ContentTaskDialog } from './content-task-dialog';

describe('content-task-dialog', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ContentTaskDialog />);
    expect(container).toBeTruthy();
  });
});
