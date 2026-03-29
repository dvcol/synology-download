import { renderWithProviders } from '../../../test/render-helper';
import { IconLoader } from './icon-loader';

describe('icon-loader', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<IconLoader icon={<span>test</span>} />);
    expect(container).toBeTruthy();
  });
});
