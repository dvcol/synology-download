import { renderWithProviders } from '../../../test/render-helper';
import { ProgressBackground } from './progress-background';

describe('progress-background', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ProgressBackground />);
    expect(container).toBeTruthy();
  });
});
