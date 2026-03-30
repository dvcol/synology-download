import { renderWithProviders } from '../../../test/render-helper';
import { ContentDetail } from './content-detail';

describe('content-detail', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContentDetail info={<span>info</span>} buttons={<span>buttons</span>} />,
    );
    expect(container).toBeTruthy();
  });
});
