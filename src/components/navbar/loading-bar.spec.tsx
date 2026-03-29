import { renderWithProviders } from '../../test/render-helper';
import { LoadingBar } from './loading-bar';

describe('loading-bar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LoadingBar />);
    expect(container).toBeTruthy();
  });
});
