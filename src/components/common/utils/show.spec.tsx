import { renderWithProviders } from '../../../test/render-helper';
import { Show } from './show';

describe('show', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Show show={true} content={<div>visible</div>} />);
    expect(container).toBeTruthy();
  });
});
