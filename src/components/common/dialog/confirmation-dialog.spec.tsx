import { renderWithProviders } from '../../../test/render-helper';
import { ConfirmationDialog } from './confirmation-dialog';

describe('confirmation-dialog', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ConfirmationDialog open={false} />);
    expect(container).toBeTruthy();
  });
});
