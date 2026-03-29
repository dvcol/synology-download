/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../test/render-helper';
import { NavbarTab } from './navbar-tab';

const mockTab = {
  id: '1',
  title: 'Downloads',
  enabled: true,
  type: 'download',
  icon: 'download',
} as any;

describe('navbar-tab', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NavbarTab tab={mockTab} value="1" />);
    expect(container).toBeTruthy();
  });
});
