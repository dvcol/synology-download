/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../test/render-helper';
import { QuickMenuRecent } from './quick-menu-recent';

const mockMenu = {
  id: '1',
  title: 'Test',
  enabled: true,
  modal: false,
  destination: '',
} as any;

describe('quick-menu-recent', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<QuickMenuRecent menu={mockMenu} logged={false} onClick={() => {}} />);
    expect(container).toBeTruthy();
  });
});
