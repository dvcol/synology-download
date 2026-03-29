import { renderWithProviders } from '../../../test/render-helper';
import { Settings } from './settings';

describe('settings', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeTruthy();
  });
});
