import { renderWithProviders } from '../../../test/render-helper';
import { TooltipHoverChange } from './tooltip-hover-change';

describe('tooltip-hover-change', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TooltipHoverChange />);
    expect(container).toBeTruthy();
  });
});
