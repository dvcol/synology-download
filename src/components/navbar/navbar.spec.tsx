import { renderWithProviders } from '../../test/render-helper';
import { Navbar } from './navbar';

describe('navbar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Navbar />);
    expect(container).toBeTruthy();
  });
});
