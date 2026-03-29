import { renderWithProviders } from '../../test/render-helper';
import { Panel } from './panel';

describe('panel', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Panel />);
    expect(container).toBeTruthy();
  });
});
