import { renderWithProviders } from '../../../../test/render-helper';
import { ExplorerRecent } from './explorer-recent';

describe('explorer-recent', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ExplorerRecent destinations={['/path1']} onSelect={() => {}} />,
    );
    expect(container).toBeTruthy();
  });
});
