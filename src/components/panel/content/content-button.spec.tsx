import { renderWithProviders } from '../../../test/render-helper';
import { ContentButton } from './content-button';

describe('content-button', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContentButton TooltipProps={{ title: 'test' }} ButtonProps={{ children: 'click' }} />,
    );
    expect(container).toBeTruthy();
  });
});
