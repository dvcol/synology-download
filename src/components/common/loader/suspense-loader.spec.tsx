import { renderWithProviders } from '../../../test/render-helper';
import { SuspenseLoader } from './suspense-loader';

describe('suspense-loader', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SuspenseLoader element={<div>test</div>} />);
    expect(container).toBeTruthy();
  });
});
