import { renderWithProviders } from '../../../test/render-helper';
import { ProgressBar } from './progress-bar';

describe('progress-bar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ProgressBar props={{}} value={50} />);
    expect(container).toBeTruthy();
  });
});
