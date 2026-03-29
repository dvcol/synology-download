import { renderWithProviders } from '../../../test/render-helper';
import { ButtonWithConfirm } from './button-with-confirm';

describe('button-with-confirm', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ButtonWithConfirm />);
    expect(container).toBeTruthy();
  });
});
