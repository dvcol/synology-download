import { renderWithProviders } from '../../test/render-helper';
import { NavbarMenuIcon } from './navbar-menu-icon';

describe('navbar-menu-icon', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NavbarMenuIcon label="test" icon={<span>icon</span>} />);
    expect(container).toBeTruthy();
  });
});
