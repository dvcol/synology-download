import { renderWithProviders } from '../../../../test/render-helper';
import { Explorer } from './explorer';

describe('explorer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Explorer />);
    expect(container).toBeTruthy();
  });
});
