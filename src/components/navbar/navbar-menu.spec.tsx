import { renderWithProviders } from '../../test/render-helper';
import { NavbarMenu } from './navbar-menu';

describe('navbar-menu', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NavbarMenu menuIcon={<span>menu</span>} />);
    expect(container).toBeTruthy();
  });
});
