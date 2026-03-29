import { renderWithProviders } from '../../test/render-helper';
import { About } from './about';

describe('about', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<About />);
    expect(container).toBeTruthy();
  });
});
