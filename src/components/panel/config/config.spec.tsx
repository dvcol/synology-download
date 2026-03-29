import { renderWithProviders } from '../../../test/render-helper';
import { Config } from './config';

describe('config', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Config />);
    expect(container).toBeTruthy();
  });
});
